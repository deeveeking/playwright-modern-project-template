// Expected UI text is stored here for clarity.
// In a real project, prefer fetching it from the application's
// manifest API, if one is available.
export const staticTestMessages = {
    loginPage: {
        invalidCredentials: "Invalid email or password",
        forgotPasswordLink: "Forgot your Password?",
    },
    forgotPasswordPage: {
        title: "Forgot Password",
    },
    accountPage: {
        title: "My account",
        description: "Here you can manage your profile, favorites and orders.",
        favorites: "Favorites",
        profile: "Profile",
        invoices: "Invoices",
        messages: "Messages",
    },
    header: {
        signIn: "Sign in",
        signOut: "Sign out",
    },
} as const;
