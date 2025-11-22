import { getAuth } from 'firebase/auth';

export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  public context: SecurityRuleContext;
  public user: any | null;

  constructor(context: SecurityRuleContext) {
    // Attempt to get the current user for context
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
        // We need to serialize the user object to get a plain object
        const userObject = currentUser.toJSON();
        this.user = userObject;
    } else {
        this.user = null;
    }

    const message = `FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:\n${JSON.stringify({ auth: this.user, ...context }, null, 2)}`;
    super(message);

    this.name = 'FirestorePermissionError';
    this.context = context;
    
    // This is necessary for the error to be properly thrown in some environments
    Object.setPrototypeOf(this, FirestorePermissionError.prototype);
  }
}
