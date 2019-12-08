import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

const config = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID
};

class Firebase {
  auth: app.auth.Auth;
  db: app.database.Database;
  googleProvider: app.auth.GoogleAuthProvider;
  emailAuthProvider: typeof app.auth.EmailAuthProvider;
  serverValue: typeof app.database.ServerValue;

  constructor() {
    app.initializeApp(config);

    this.serverValue = app.database.ServerValue;
    this.emailAuthProvider = app.auth.EmailAuthProvider;
    this.auth = app.auth();
    this.db = app.database();

    this.googleProvider = new app.auth.GoogleAuthProvider();
  }

  // Auth API

  doCreateUserWithEmailAndPassword = (email: string, password: string) =>
    this.auth.createUserWithEmailAndPassword(email, password);

  doSignInWithEmailAndPassword = (email: string, password: string) =>
    this.auth.signInWithEmailAndPassword(email, password);

  doSendEmailVerification = () =>
    this.auth.currentUser &&
    this.auth.currentUser.sendEmailVerification({
      url: process.env.REACT_APP_CONFIRMATION_EMAIL_REDIRECT as string
    });

  doSignInWithGoogle = () => this.auth.signInWithPopup(this.googleProvider);

  doSignOut = () => this.auth.signOut();

  doPasswordReset = (email: string) => this.auth.sendPasswordResetEmail(email);

  doPasswordUpdate = (password: string) =>
    this.auth.currentUser && this.auth.currentUser.updatePassword(password);

  // Merge Auth and DB User API

  onAuthUserListener = (next: any, fallback: any) =>
    this.auth.onAuthStateChanged(authUser => {
      if (authUser) {
        this.user(authUser.uid)
          .once('value')
          .then((snapshot: any) => {
            const dbUser = snapshot.val();

            // Default empty roles
            if (!dbUser.roles) {
              dbUser.roles = {};
            }

            // Merge auth and db user
            if (authUser !== null) {
              authUser = {
                uid: authUser.uid,
                email: authUser.email,
                emailVerified: authUser.emailVerified,
                providerData: authUser.providerData,
                ...dbUser
              };
            }

            next(authUser);
          });
      } else {
        fallback();
      }
    });

  // User API

  users = () => this.db.ref('users');
  user = (uid: string) => this.db.ref(`users/${uid}`);

  // Charts API

  charts = () => this.db.ref('charts');
  chart = (uid: string) => this.db.ref(`charts/${uid}`);
}

export default Firebase;
