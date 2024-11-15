import { useState, useCallback, useEffect } from 'react';

export function useFormAndValidation() {
    const [values, setValues] = useState({});
    const [errors, setErrors] = useState({});
    const [isInputValid, setIsInputValid] = useState(true);
    const [isFormValid, setIsFormValid] = useState(false);
    const [isSubmitButtonActive, setIsSubmitButtonActive] = useState(false);
    const getInputNames = (inputElements) => {
      const nameInputs = inputElements.map((input) => {
        return input.name;
      });
      return nameInputs;
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setValues({ ...values, [name]: value });
        setErrors({ ...errors, [name]: e.target.validationMessage });
        setIsFormValid(e.target.closest('form').checkValidity());
        setIsInputValid({ ...isInputValid, [name]: e.target.checkValidity() });
    };

    const resetForm = useCallback((newValues = {}, newErrors = {}, newIsInputValid = true, newIsFormValid = false) => {
        setValues(newValues);
        setErrors(newErrors);
        setIsInputValid(newIsInputValid);
        setIsFormValid(newIsFormValid);
    }, [setValues, setErrors, setIsInputValid, setIsFormValid]);

    useEffect(() => {
        if (isFormValid) {
            setIsSubmitButtonActive(true);
        } else {
            setIsSubmitButtonActive(false);
        }
    }, [isFormValid]);

    return { values, handleChange, errors, isInputValid, resetForm, setValues, setIsInputValid, setIsSubmitButtonActive, isSubmitButtonActive, getInputNames };
}
