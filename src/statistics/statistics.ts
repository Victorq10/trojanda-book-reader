export class Statistics {
    abc = ['ʼ', 'А', 'Б', 'В', 'Г', 'Ґ', 'Д', 'Е', 'Є', 'Ж', 'З', 'І', 'И', 'Ї', 'Й', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ь', 'Ю', 'Я']
    // U2019  - ’ - single quote used often as an apostrophe (deprecated)
    // U02BC  - ʼ -  Ukrainian apostrophe
    apostrophes = ["'",'’','ʼ'];
    filter_letters = 'ІИ';
    res = new Map();
    count = new Map();
    out = '';
    number_of_symbols = 3;
    private add_res(c: string) {
        //  if (c.length == 5 || c.length == 4 || c.length == 1) {
        //  if (filter_letters.indexOf(c) == -1) {
        //      return;
        //  }
        if (c.length === this.number_of_symbols) {
            if (this.apostrophes.includes(c)) {
                c = 'ʼ'; // replace with U02BC - ʼ -  Ukrainian apostrophe
            }
            this.res.set(c, (this.res.get(c) || 0) + 1);
            this.count.set('count' + c.length, (this.count.get('count' + c.length) || 0) + 1);
            this.count.set('count', (this.count.get('count') || 0) + 1);
        }

    }
    static count_symbols(number_of_symbols: number = 1): Statistics {
        if (!number_of_symbols) {
            number_of_symbols = 1;
        } else if (number_of_symbols > 3) {
            number_of_symbols = 3;
        }
        const statistics = new Statistics();
        statistics.number_of_symbols = number_of_symbols; 
        statistics.count_symbols_intenal();
        return statistics;
    }
    //if (/[\d\s\(\)\.\,\-–—\';:·]/.test(c)) {
    private count_symbols_intenal() {
        // init full alphabet letters
        if (this.number_of_symbols === 1) {
            this.abc.forEach((letter) => {
                this.res.set(letter, 0);
            });
        }

        //txt = document.querySelector("#featurded_article").innerText.trim();
        //txt = document.querySelector("#content").innerText.trim();
        //txt = document.querySelector(".PostPublication").innerText.trim();
        //const txt = document.getElementById('js-reading-content').textContent.trim();
        let prevC = '';
        const reading_content = document.getElementById('js-reading-content')
        const all_elmt = reading_content.getElementsByTagName('*')
        for (let i = 0; i < all_elmt.length; i++) {
            let elmt = all_elmt[i];
            for (let j = 0; j < elmt.childNodes.length; j++) {
                let node = elmt.childNodes[j];
                if (node.nodeType === node.TEXT_NODE) {
                    const txt = node.textContent;
                    for (let i = 0; i < txt.length; i++) {
                        const c = txt.charAt(i).toUpperCase();
                        if (this.abc.includes(c) || this.apostrophes.includes(c)) {
                            prevC = (prevC + c).substr(-this.number_of_symbols);
                            for (let j = prevC.length; j > 0; j--) {
                                this.add_res(prevC.substr(-j));
                            }
                        } else {
                            prevC = '';
                        }
                    }
                }
            }
        }
        this.count.forEach((value, key) => {
            this.out += `${key}\t${value}\n`;
        })
        this.out += "# пп | Літера | Кількість | Відсоток * 10\n";
        this.out += "---- | ------ | --------- | -------------\n";
        const not_sorted_array = new Array();
        this.res.forEach((value, key) => {
            not_sorted_array.push([key, value]);
        });

        const sorted_array = not_sorted_array.sort((a: any, b: any) => {
            if (a[0].length != b[0].length) {
                return a[0].length - b[0].length;
            }
            return b[1] - a[1];
        });
        let count2 = 0;
        let i = 0;
        sorted_array.forEach((value: any, i, array) => {
            i++;
            //console.log(`${e[0]} : ${e[1]}    => ${Math.round((e[1] / count) * 100000) / 100}`);
            this.out += `${i}.\t${value[0]}\t${value[1]}\t        ${((value[1] / this.count.get('count' + value[0].length)) * 1000).toFixed(2)}\n`;
            //console.log(`${e[0]} : ${e[1]}    => ${e[1] / count}`);
            count2 += value[1];
        });
        return this.out;
    }
}

