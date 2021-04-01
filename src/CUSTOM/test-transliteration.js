// see 
// from the https://github.com/core-process/transliterations/blob/master/data/charmap.json
const charmap = {
    "0": ["\u0000","\u0001","\u0002","\u0003","\u0004","\u0005","\u0006","\u0007","\b","\t","\n","\u000b","\f","\r","\u000e","\u000f","\u0010","\u0011","\u0012","\u0013","\u0014","\u0015","\u0016","\u0017","\u0018","\u0019","\u001a","\u001b","\u001c","\u001d","\u001e","\u001f"," ","!","\"","#","$","%","&","'","(",")","*","+",",","-",".","/","0","1","2","3","4","5","6","7","8","9",":",";","<","=",">","?","@","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","[","\\","]","^","_","`","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","{","|","}","~","\u007f","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""," ","!","C/","PS","$?","Y=","|","SS","\"","(c)","a","<<","!","","(r)","-","deg","+-","2","3","'","u","P","*",",","1","o",">>","1/4","1/2","3/4","?","A","A","A","A","A","A","AE","C","E","E","E","E","I","I","I","I","D","N","O","O","O","O","O","x","O","U","U","U","U","U","Th","ss","a","a","a","a","a","a","ae","c","e","e","e","e","i","i","i","i","d","n","o","o","o","o","o","/","o","u","u","u","u","y","th","y"],
    "1": ["A","a","A","a","A","a","C","c","C","c","C","c","C","c","D","d","D","d","E","e","E","e","E","e","E","e","E","e","G","g","G","g","G","g","G","g","H","h","H","h","I","i","I","i","I","i","I","i","I","i","IJ","ij","J","j","K","k","k","L","l","L","l","L","l","L","l","L","l","N","n","N","n","N","n","'n","NG","ng","O","o","O","o","O","o","OE","oe","R","r","R","r","R","r","S","s","S","s","S","s","S","s","T","t","T","t","T","t","U","u","U","u","U","u","U","u","U","u","U","u","W","w","Y","y","Y","Z","z","Z","z","Z","z","s","b","B","B","b","6","6","O","C","c","D","D","D","d","d","3","@","E","F","f","G","G","hv","I","I","K","k","l","l","W","N","n","O","O","o","OI","oi","P","p","YR","2","2","SH","sh","t","T","t","T","U","u","Y","V","Y","y","Z","z","ZH","ZH","zh","zh","2","5","5","ts","w","|","||","|=","!","DZ","Dz","dz","LJ","Lj","lj","NJ","Nj","nj","A","a","I","i","O","o","U","u","U","u","U","u","U","u","U","u","@","A","a","A","a","AE","ae","G","g","G","g","K","k","O","o","O","o","ZH","zh","j","DZ","D","dz","G","g","HV","W","N","n","A","a","AE","ae","O","o"],
    "2": ["A","a","A","a","E","e","E","e","I","i","I","i","O","o","O","o","R","r","R","r","U","u","U","u","S","s","T","t","Y","y","H","h","N","d","OU","ou","Z","z","A","a","E","e","O","o","O","o","O","o","O","o","Y","y","l","n","t","j","db","qp","A","C","c","L","T","s","z","?","?","B","U","V","E","e","J","j","Q","q","R","r","Y","y","a","a","a","b","o","c","d","d","e","@","@","e","e","e","e","j","g","g","g","g","u","Y","h","h","i","i","I","l","l","l","lZ","W","W","m","n","n","n","o","OE","O","F","R","R","R","R","r","r","R","R","R","s","S","j","S","S","t","t","U","U","v","^","W","Y","Y","z","z","Z","Z","?","?","?","C","@","B","E","G","H","j","k","L","q","?","?","dz","dZ","dz","ts","tS","tC","fN","ls","lz","WW","]]","h","h","k","h","j","r","r","r","r","w","y","'","\"","`","'","`","`","'","?","?","<",">","^","V","^","V","'","-","/","\\",",","_","\\","/",":",".","`","'","^","V","+","-","V",".","@",",","~","\"","R","X","G","l","s","x","?","","","","","","","","V","=","\"",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
    "3": ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"","","",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"'",",",null,null,null,null,"",null,null,null,"?",null,null,null,null,null,"","","A",";","E","I","I",null,"O",null,"U","O","I","A","V","G","D","E","Z","I","Th","I","K","L","M","N","X","O","P","R",null,"S","T","Y","F","H","Ps","O","I","Y","a","e","i","i","y","a","v","g","d","e","z","i","th","i","k","l","m","n","x","o","p","r","s","s","t","y","f","h","ps","o","i","y","o","y","o",null,"b","th","U","U","U","ph","p","&",null,null,"St","st","W","w","Q","q","Sp","sp","Sh","sh","F","f","Kh","kh","H","h","G","g","CH","ch","Ti","ti","k","r","c","j",null,null,null,null,null,null,null,null,null,null,null,null],
    "4": ["Jo","Yo","Dj","Gj","Ie","Dz","I","Yi","J","Lj","Nj","Tsh","Kj","I","U","Dzh","A","B","V","G","D","E","Zh","Z","I","Y","K","L","M","N","O","P","R","S","T","U","F","H","C","Ch","Sh","Shch","","Y","","E","Yu","Ya","a","b","v","g","d","e","zh","z","i","y","k","l","m","n","o","p","r","s","t","u","f","h","c","ch","sh","shch","","y","","e","yu","ya","je","yo","dj","gj","ie","dz","i","yi","j","lj","nj","tsh","kj","i","u","dzh","O","o","E","e","Ie","ie","E","e","Ie","ie","O","o","Io","io","Ks","ks","Ps","ps","F","f","Y","y","Y","y","u","u","O","o","O","o","Ot","ot","Q","q","*1000*","","","","",null,"*100.000*","*1.000.000*",null,null,"\"","\"","R'","r'","G'","g'","G'","g'","G'","g'","Zh'","zh'","Z'","z'","K'","k'","K'","k'","K'","k'","K'","k'","N'","n'","Ng","ng","P'","p'","Kh","kh","S'","s'","T'","t'","U","u","U'","u'","Kh'","kh'","Tts","tts","Ch'","ch'","Ch'","ch'","H","h","Ch","ch","Ch'","ch'","`","Zh","zh","K'","k'",null,null,"N'","n'",null,null,"Ch","ch",null,null,null,"a","a","A","a","Ae","ae","Ie","ie","@","@","@","@","Zh","zh","Z","z","Dz","dz","I","i","I","i","O","o","O","o","O","o","E","e","U","u","U","u","U","u","Ch","ch",null,null,"Y","y",null,null,null,null,null,null],
    "5": [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"A","B","G","D","E","Z","E","E","T`","Zh","I","L","Kh","Ts","K","H","Dz","Gh","Ch","M","Y","N","Sh","O","Ch`","P","J","Rh","S","V","T","R","Ts`","W","P`","K`","O","F",null,null,"<","'","/","!",",","?",".",null,"a","b","g","d","e","z","e","e","t`","zh","i","l","kh","ts","k","h","dz","gh","ch","m","y","n","sh","o","ch`","p","j","rh","s","v","t","r","ts`","w","p`","k`","o","f","ew",null,".","-",null,null,null,null,null,null,"","","","","","","","","","","","","","","","","",null,"","","","","","","","","","","","","","@","e","a","o","i","e","e","a","a","o",null,"u","'","","","","","","",":","",null,null,null,null,null,null,null,null,null,null,null,"","b","g","d","h","v","z","kh","t","y","k","k","l","m","m","n","n","s","`","p","p","ts","ts","q","r","sh","t",null,null,null,null,null,"V","oy","i","'","\"",null,null,null,null,null,null,null,null,null,null,null]}
// from the "https://github.com/FGRibreau/node-unidecode/blob/master/data/x04.js"
const unicode = [ "Ie","Io","Dj","Gj","Ie","Dz","I","Yi","J","Lj","Nj","Tsh","Kj","I","U","Dzh","A","B","V","G","D","Ie","Zh","Z","I","I","K","L","M","N","O","P","R","S","T","U","F","Kh","Ts","Ch","Sh","Shch","","Y","'","E","Iu","Ia","a","b","v","gh","d","ie","zh","z","i","i","k","l","m","n","o","p","r","s","t","u","f","kh","ts","ch","sh","shch","","y","'","e","iu","ia","ie","io","dj","gj","ie","dz","i","yi","j","lj","nj","tsh","kj","i","u","dzh","O","o","E","e","Ie","ie","E","e","Ie","ie","O","o","Io","io","Ks","ks","Ps","ps","F","f","Y","y","Y","y","u","u","O","o","O","o","Ot","ot","Q","q","*1000*","","","","","[?]","*100.000*","*1.000.000*","[?]","[?]","\"","\"","R'","r'","G'","g'","G'","g'","G'","g'","Zh'","zh'","Z'","z'","K'","k'","K'","k'","K'","k'","K'","k'","N'","n'","Ng","ng","P'","p'","Kh","kh","S'","s'","T'","t'","U","u","U'","u'","Kh'","kh'","Tts","tts","Ch'","ch'","Ch'","ch'","H","h","Ch","ch","Ch'","ch'","`","Zh","zh","K'","k'","[?]","[?]","N'","n'","[?]","[?]","Ch","ch","[?]","[?]","[?]","a","a","A","a","Ae","ae","Ie","ie","@","@","@","@","Zh","zh","Z","z","Dz","dz","I","i","I","i","O","o","O","o","O","o","E","e","U","u","U","u","U","u","Ch","ch","[?]","[?]","Y","y","[?]","[?]","[?]","[?]","[?]" ];

const string = "АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯабвгґдеєжзиіїйклмнопрстуфхцчшщьюя";
let counter = 0;
while (counter < string.length) {
    const ch = string.charAt(counter)
    const charCode = string.charCodeAt(counter++);
    let ord = charCode;
    let offset = (ord >> 8);
    ord &= 0xff;
    let text = charmap[offset][ord];
    let text2 = unicode[ord]
    console.log(`${ch}: ${charCode} ${offset} ${ord}      ${text}   ${text2}`)
}