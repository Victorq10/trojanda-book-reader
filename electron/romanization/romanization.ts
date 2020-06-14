const uk_2_la = ((): Map<string, string> => {
    const ukrainian_alphabit = 'АБВГҐДЕЄ ЖЗИІЇ ЙКЛМНОПРСТУФХЦЧШЩ ЬЮ Я ';
    const latin_alphabit = 'ABVHGDEJeŽZYIJiJKLMNOPRSTUFXCČŠŠčJJuJa';
    const uk_2_la = new Map<string, string>();
    for (let i = 0; i < ukrainian_alphabit.length; i++) {
        if (ukrainian_alphabit[i + 1] === ' ') {
            uk_2_la.set(ukrainian_alphabit[i], latin_alphabit.slice(i, i + 2));
            i++;
        } else {
            uk_2_la.set(ukrainian_alphabit[i], latin_alphabit[i]);
        }
    }
    uk_2_la.forEach((v, k) => { uk_2_la.set(k.toLowerCase(), v.toLowerCase()); })
    return uk_2_la;
})();
function is_capital_letter(letter: string): boolean {
    return letter && letter.toUpperCase() === letter;
}
export function romanize(text: string): string {
    let romanized_text = [];
    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        if (uk_2_la.has(char)) {
            let la_char = uk_2_la.get(char);
            if (char.toUpperCase() === char && (is_capital_letter(text[i + 1]) || is_capital_letter(text[i - 1]))) {
                la_char = la_char.toUpperCase();
            }
            romanized_text.push(la_char);
        } else {
            romanized_text.push(char);
        }
    }
    return romanized_text.join('');
}
//console.log(romanize('Привіт Світ!'))
//console.log(romanize('Ягуар ЯГУАР найкращій. ЩАСТЯ'))
