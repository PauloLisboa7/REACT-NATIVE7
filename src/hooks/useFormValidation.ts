import { useState, useCallback } from 'react';
import { patterns, messages } from '../config/constants';

interface ValidationError {
  field: string;
  message: string;
}

/**
 * Hook para validação de formulário
 */
export const useFormValidation = () => {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const validateEmail = useCallback((email: string): boolean => {
    if (!patterns.email.test(email)) {
      setErrors((prev) => [
        ...prev.filter((e) => e.field !== 'email'),
        { field: 'email', message: messages.auth.invalidEmail },
      ]);
      return false;
    }
    setErrors((prev) => prev.filter((e) => e.field !== 'email'));
    return true;
  }, []);

  const validatePassword = useCallback(
    (password: string, minLength: number = 6): boolean => {
      if (password.length < minLength) {
        setErrors((prev) => [
          ...prev.filter((e) => e.field !== 'password'),
          { field: 'password', message: messages.auth.passwordTooShort },
        ]);
        return false;
      }
      setErrors((prev) => prev.filter((e) => e.field !== 'password'));
      return true;
    },
    []
  );

  const validatePasswordMatch = useCallback(
    (password: string, confirmPassword: string): boolean => {
      if (password !== confirmPassword) {
        setErrors((prev) => [
          ...prev.filter((e) => e.field !== 'confirmPassword'),
          { field: 'confirmPassword', message: messages.auth.passwordMismatch },
        ]);
        return false;
      }
      setErrors((prev) => prev.filter((e) => e.field !== 'confirmPassword'));
      return true;
    },
    []
  );

  const validateName = useCallback((name: string): boolean => {
    if (name.trim().length < 3) {
      setErrors((prev) => [
        ...prev.filter((e) => e.field !== 'name'),
        { field: 'name', message: messages.validation.nameTooShort },
      ]);
      return false;
    }
    setErrors((prev) => prev.filter((e) => e.field !== 'name'));
    return true;
  }, []);

  const validateAge = useCallback((age: string): boolean => {
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 18) {
      setErrors((prev) => [
        ...prev.filter((e) => e.field !== 'age'),
        { field: 'age', message: messages.validation.ageTooLow },
      ]);
      return false;
    }
    setErrors((prev) => prev.filter((e) => e.field !== 'age'));
    return true;
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors((prev) => prev.filter((e) => e.field !== field));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const getError = useCallback(
    (field: string): string | undefined => {
      return errors.find((e) => e.field === field)?.message;
    },
    [errors]
  );

  return {
    errors,
    validateEmail,
    validatePassword,
    validatePasswordMatch,
    validateName,
    validateAge,
    clearError,
    clearAllErrors,
    getError,
  };
};
