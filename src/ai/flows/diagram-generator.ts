
// 'use server';

// /**
//  * @fileOverview Diagram generator flow.
//  *
//  * - generateDiagram - A function that handles the diagram generation process.
//  * - GenerateDiagramInput - The input type for the generateDiagram function.
//  * - GenerateDiagramOutput - The return type for the generateDiagram function.
//  */

// import {ai} from '@/ai/genkit';
// import {z} from 'genkit';

// const GenerateDiagramInputSchema = z.object({
//   topic: z.string().describe('The topic or concept for which to generate a diagram.'),
// });
// export type GenerateDiagramInput = z.infer<typeof GenerateDiagramInputSchema>;

// const GenerateDiagramOutputSchema = z.object({
//   diagramDataUri: z.string().describe('The generated diagram as a data URI.'),
// });
// export type GenerateDiagramOutput = z.infer<typeof GenerateDiagramOutputSchema>;

// export async function generateDiagram(input: GenerateDiagramInput): Promise<GenerateDiagramOutput> {
//   return generateDiagramFlow(input);
// }

// const generateDiagramFlow = ai.defineFlow(
//   {
//     name: 'generateDiagramFlow',
//     inputSchema: GenerateDiagramInputSchema,
//     outputSchema: GenerateDiagramOutputSchema,
//   },
//   async (input) => {
//     const {media} = await ai.generate({
//         model: 'googleai/gemini-2.5-flash',
//         prompt: `Generate a clear, concise, and student-friendly chalkboard-style diagram that visually explains the concept of: ${input.topic}`,
//         config: {
//             responseModalities: ['TEXT', 'IMAGE'],
//         },
//     });

//     if (!media?.url) {
//         throw new Error('Image generation failed.');
//     }

//     return { diagramDataUri: media.url };
//   }
// );



'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiagramInputSchema = z.object({
  topic: z.string().describe('The topic to generate a diagram for'),
});

export type DiagramInput = z.infer<typeof DiagramInputSchema>;

const DiagramOutputSchema = z.object({
  imageUrl: z.string().describe('The generated diagram image URL'),
});

export type DiagramOutput = z.infer<typeof DiagramOutputSchema>;

export async function generateDiagram(input: DiagramInput): Promise<DiagramOutput> {
  return generateDiagramFlow(input);
}

const generateDiagramFlow = ai.defineFlow(
  {
    name: 'generateDiagramFlow',
    inputSchema: DiagramInputSchema,
    outputSchema: DiagramOutputSchema,
  },
  async (input) => {
    // Use Gemini to create a detailed prompt for the diagram
    const {text} = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: `Create a detailed prompt for generating an educational diagram about: "${input.topic}".

The prompt should describe:
- A clear, simple educational diagram
- Clean chalkboard or whiteboard style
- Key concepts with labels and arrows
- Easy to understand for students
- Professional and educational look

Return ONLY the image generation prompt, nothing else.`,
    });

    const imagePrompt = text.trim();

    console.log('Generated prompt:', imagePrompt);

    // Step 1: Submit generation request to Kie.AI
    const generateResponse = await fetch('https://api.kie.ai/api/v1/gpt4o-image/generate', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 6d3c1098d3dae4fa13a46fc780e79aa6',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: imagePrompt,
        size: '1:1',
        isEnhance: true,
        nVariants: 1,
        enableFallback: true,
        fallbackModel: 'FLUX_MAX'
      }),
    });

    if (!generateResponse.ok) {
      const error = await generateResponse.text();
      throw new Error(`Kie.AI generate error: ${error}`);
    }

    const generateData = await generateResponse.json();
    console.log('Generate response:', generateData);
    
    if (!generateData.data || !generateData.data.taskId) {
      throw new Error('No taskId returned from Kie.AI');
    }

    const taskId = generateData.data.taskId;
    console.log('Task ID:', taskId);

    // Step 2: Poll for the result
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds max wait (2 seconds per attempt)
    let imageUrl = '';

    while (attempts < maxAttempts) {
      // Wait 2 seconds before checking
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log(`Polling attempt ${attempts + 1}/${maxAttempts} for taskId: ${taskId}`);

      const resultResponse = await fetch(
        `https://api.kie.ai/api/v1/gpt4o-image/record-info?taskId=${taskId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer 6d3c1098d3dae4fa13a46fc780e79aa6',
          },
        }
      );

      if (!resultResponse.ok) {
        console.log(`Attempt ${attempts + 1}: Response not OK, status ${resultResponse.status}`);
        attempts++;
        continue;
      }

      const resultData = await resultResponse.json();
      console.log(`Attempt ${attempts + 1}: Response data:`, JSON.stringify(resultData, null, 2));

      if (resultData.code === 200 && resultData.data) {
        const data = resultData.data;
        
        console.log(`Status: ${data.status}, SuccessFlag: ${data.successFlag}, Progress: ${data.progress}`);

        // Check if generation is complete
        if (data.status === 'SUCCESS' || data.successFlag === 1) {
          // Try to get image URL from response
          if (data.response?.resultUrls && data.response.resultUrls.length > 0) {
            imageUrl = data.response.resultUrls[0];
            console.log(`✓ Image URL found: ${imageUrl}`);
            break;
          } else {
            console.log('Status is SUCCESS but no resultUrls found in response');
          }
        }

        // Check for failure
        // Check for failure
        if (data.status === 'FAILED') {
          const errorMsg = data.errorMessage || data.errorCode || 'Unknown error';
          console.log(`✗ Image generation failed: ${errorMsg}`);
          throw new Error(`Image generation failed: ${errorMsg}`);
        }

        // Still processing
        console.log(`Still processing... Progress: ${data.progress || 'unknown'}`);
      }

      attempts++;
    }

    if (!imageUrl) {
      console.log('✗ Timed out waiting for image generation');
      throw new Error(`Image generation timed out after ${maxAttempts * 2} seconds`);
    }

    console.log('✓ Diagram generation complete!');
    
    return {
      imageUrl,
    };
  }
);