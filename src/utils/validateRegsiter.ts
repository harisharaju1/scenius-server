import { UsernamePasswordInput } from "src/resolvers/UsernamePasswordInput";

export const validateRegsiter = (options: UsernamePasswordInput) => {
  if (options.username.length <= 4) {
    return [
      {
        field: "username",
        message: "Length must be greater than 4",
      },
    ];
  }
  if (options.username.includes("@")) {
    return [
      {
        field: "username",
        message: "Username cannot include @",
      },
    ];
  }
  if (options.password.length <= 6) {
    return [
      {
        field: "password",
        message: "Length must be greater than 6",
      },
    ];
  }
  if (!options.email.includes("@")) {
    return [
      {
        field: "email",
        message: "Please enter valid email address",
      },
    ];
  }
  return null;
};
