import * as yup from "yup";

export type AuthFormData = {
    email: string;
    password: string;
    username?: string;
    passwordConfirm?: string;
}

const COMMON_PASSWORDS = ["passwort123", "password123", "1234567890", "wichtig123", "qwertz123"];

export const authSchema: yup.ObjectSchema<AuthFormData> = yup.object({
    email: yup.string()
        .email("Bitte gib eine gültige E-Mail-Adresse ein.")
        .required("E-Mail ist ein Pflichtfeld."),
    password: yup.string()
        .required("Passwort ist ein Pflichtfeld.")
        .min(8, "Das Passwort muss mindestens 8 Zeichen lang sein (NIST-Standard).")
        .test("not-common", "Dieses Passwort ist zu leicht zu erraten. Bitte wähle ein kreativeres Passwort.",
            value => !value || !COMMON_PASSWORDS.includes(value.toLowerCase())
        ),
    username: yup.string().when("$isRegister", {
        is: true,
        then: (schema) => schema
            .trim()
            .required("Der Nutzername ist ein Pflichtfeld.")
            .min(3, "Der Nutzername muss mindestens 3 Zeichen lang sein."),
        otherwise: (schema) => schema.notRequired()
    }),
    passwordConfirm: yup.string().when("$isRegister", {
        is: true,
        then: (schema) => schema
            .required("Bitte wiederhole dein Passwort.")
            .oneOf([yup.ref("password")], "Die Passwörter stimmen nicht überein."),
        otherwise: (schema) => schema.notRequired()
    })
});