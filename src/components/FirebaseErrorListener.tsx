'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/lib/error-emitter';
import { useToast } from '@/hooks/use-toast';
import { type FirestorePermissionError } from '@/lib/errors';
import { Button } from '@/components/ui/button';

// This is an ugly, developer-facing error message. It is not intended for end-users.
// It is designed to provide as much context as possible to the developer to debug security rules.
const DevErrorDisplay = ({ error }: { error: FirestorePermissionError }) => {
    const context = error.context;
    const user = error.user;
  
    const handleCopy = () => {
      navigator.clipboard.writeText(JSON.stringify({ context, user }, null, 2));
    };

    return (
        <div className="flex flex-col gap-4">
            <p>The following request was denied by Firestore Security Rules:</p>
            <pre className="bg-muted p-2 rounded-md text-xs overflow-auto">
                <code>{JSON.stringify(context, null, 2)}</code>
            </pre>
            {user && (
                 <div>
                    <p>The authenticated user object was:</p>
                    <pre className="bg-muted p-2 rounded-md text-xs overflow-auto max-h-48">
                        <code>{JSON.stringify(user, null, 2)}</code>
                    </pre>
                </div>
            )}
             <Button size="sm" variant="outline" onClick={handleCopy}>
                Copy JSON
            </Button>
        </div>
    );
};


export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      console.error("Firestore Permission Error Caught:", error.message, error.context);
      
      // Throw the error to make it visible in the Next.js development overlay
      // This is the primary mechanism for developers to see the detailed error.
      if (process.env.NODE_ENV === 'development') {
        throw error;
      }

      // Also show a toast as a fallback, especially for production environments.
      toast({
        variant: 'destructive',
        title: 'Permissions Error',
        description: <DevErrorDisplay error={error} />,
        duration: Infinity, // Keep the toast open until dismissed
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null; // This component does not render anything
}
