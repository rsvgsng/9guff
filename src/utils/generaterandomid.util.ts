export function generateRandomId(length: number) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomId = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        randomId += chars.charAt(randomIndex);
    }
    return randomId;
}


export const badWords = [
    'muji',
    'lado',
    'mg',
    'mc',
    'condo',
    'gm',
    'gomendra',
    'randi',
    'rnd',
    'chikne',
    'chikney',
    'bhalu',
    'valu',
    'jhata',
    'jatha',
    'puti',
    'geda',
    'gulla',
    'gula',
    'machikne',
    'machikey',
    'chik',
    'khate',
    'khatey',
    'fuck',
    'fucker',
    'turi',
    'turee',
    'lauda',
    'fuck',
    'dick',
    'nigger',
    'cock',
    'pussy',
    'gay',
    'gays',
    'cunt',
    'whore',
    'bitch',
    'slut',
    'fucking'
];

export const forbiddenUsernames =
    [
        "admin",
        "rupaksir",
        "rsvgsng",
        "default",
        "somdai",
        "gmcollege",
        "gomendra",
        'muji',
        'lado',
        'mg',
        'mc',
        'condo',
        'gm',
        'gomendra',
        'randi',
        'rnd',
        'chikne',
        'chikney',
        'bhalu',
        'valu',
        'jhata',
        'jatha',
        'puti',
        'geda',
    ]