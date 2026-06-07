import * as yup from "yup";

export type ProfileFormData = {
    username: string,
    email: string,
    newPassword?: string,
    confirmPassword?: string,
}

export const profileSchema: yup.ObjectSchema<ProfileFormData> = yup.object({
    username: yup.string()
        .trim()
        .required("Der Nutzername ist ein Pflichtfeld und darf nicht leer sein.")
        .min(3, "Der Nutzername muss mindestens 3 Zeichen lang sein."),
    email: yup.string()
        .email("Bitte gibt eine gültige E-Mai-Adresse ein.")
        .required("Die E-Mail-Adresse ist ein Pflichtfeld."),
    newPassword: yup.string()
        .transform(value => value === "" ? undefined : value)
        .min(8, "Das neue Passwort muss mindestens 8 Zeichen lang sein (NIST-Standard).")
        .notRequired() as yup.Schema<string | undefined>,
    confirmPassword: yup.string()
        .transform(value => value === "" ? undefined : value)
        .notRequired()
        .when("newPassword", {
            is: (val: any) => val && val.length > 0,
            then: (schema) => schema
                .required("Bitte wiederhole dein neues Passwort.")
                .oneOf([yup.ref("newPassword")], "Die Passwörter stimmen nicht überein."),
            otherwise: (schema) => schema.notRequired()
        }) as yup.Schema<string | undefined>
})