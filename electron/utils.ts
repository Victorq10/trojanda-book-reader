import * as path from 'path'
import * as fs from 'fs'

function test_write_file() {
    var filepath = path.join(__dirname, '.', 'TESTEXISTEDFILE.md');
    var content = "This is the new content of the file";

    fs.writeFile(filepath, content, (err : any) => {
        if (err) {
            alert("An error ocurred updating the file" + err.message);
            console.log(err);
            return;
        }

        alert("The file has been succesfully saved");
    });
}
