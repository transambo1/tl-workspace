const ERROR_MESSAGES: Record<string, (args?: any) => string> = {
  required: () => 'This is required',
  email: () => 'The email address need correct the format',
  minlength: (args: { requiredLength: number }) =>
    `Please type minimum ${args.requiredLength} character`,
  maxlength: (args: { requiredLength: number }) =>
    `Please type maxium ${args.requiredLength} character`,
  min: (args: { min: number }) => `The minimum value must be ${args.min}.`,
  max: (args: { max: number }) => `The maxium value must be ${args.max}.`,
  pattern: () => 'Invalid data format',
};

/**
 * @param validatorName Tên của lỗi (ví dụ: 'required', 'email', 'minlength')
 * @param validatorValue Các thuộc tính phụ đi kèm lỗi (ví dụ: { requiredLength: 6 } của minlength)
 */

export function getValidatorMessage(validatorName: string, validatorValue?: any): string {
  const messageFn = ERROR_MESSAGES[validatorName];
  if (messageFn) {
    return messageFn(validatorValue);
  }
  return 'Invalid field';
}
