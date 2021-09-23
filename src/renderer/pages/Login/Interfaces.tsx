/* eslint-disable @typescript-eslint/no-unused-vars */

interface FormHeaderProps {
  heading: string,
  body: string
}

interface FormTextFieldProps {
  handler: any,
  id: string,
  label: string,
  required?: boolean,
  sensitive?: boolean
}

interface FormStatusFieldProps {
  message: string,
  type: string
}

