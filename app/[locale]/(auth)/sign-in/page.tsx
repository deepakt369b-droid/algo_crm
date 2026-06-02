import React from "react";
import { LoginComponent } from "./components/LoginComponent";

const SignInPage = async () => {
  return (
    <div className="w-full">
      <div className="flex flex-col space-y-2 text-center mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email to sign in to your workspace
        </p>
      </div>
      <LoginComponent />
    </div>
  );
};

export default SignInPage;
