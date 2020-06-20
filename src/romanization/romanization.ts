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
const uk_2_la_swap_i_y = ((): Map<string, string> => {
    const override_letters = new Map<string, string>()
    override_letters.set('і', 'y');
    override_letters.set('и', 'i');
    const result = new Map<string, string>();
    uk_2_la.forEach((value, key, map) => {
        if (override_letters.has(key)) {
            result.set(key, override_letters.get(key));
        } else {
            result.set(key, value);
        }
    });
    return result;
})();
function is_capital_letter(letter: string): boolean {
    if (letter) {
        const upper_case_letter = letter.toUpperCase();
        return upper_case_letter !== letter.toLowerCase() && upper_case_letter === letter;
    }
    return false
}
export function romanize(text: string, swap_i_y: boolean = false): string {
    let translate_map = swap_i_y ? uk_2_la_swap_i_y: uk_2_la;
    let romanized_text = [];
    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        if (translate_map.has(char)) {
            let la_char = translate_map.get(char);
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
//console.log(romanize('– Якщо не ви, то хто?'))
