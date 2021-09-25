'use strict';
const express       =   require('express');
const cookieParser  =   require('cookie-parser');
const fs            =   require('fs');
const multer        =   require('multer');
const upload        =   require('./custom');
const mysql         =   require('mysql');
const jwt           =   require('jsonwebtoken');
const {spawnSync}   =   require('child_process');
const func          =   require('./userfunc');

const app           =   express();
const conn          =   func.connection();
const SECRET        =   process.env.SECRET;
const PORT          =   process.env.PORT;
const basedir       =   "./publics/uploads/"

console.log(`[*] The secret value is ${SECRET}`);

app.use(cookieParser());
app.use(express.urlencoded({extended: true}));

app.set('views', __dirname + '/template');
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.get('/login', (req, res) => {
    res.render('login.ejs');
});

//login function using sql, jwt token, might need login with "korea_pocas"
app.post('/login', (req, res) => {
    const id = req.body.id;
    const pw = req.body.pw;

    if (id == '' || pw ==''){
        res.send("<script>alert('Empty values must not exist');history.go(-1);</script>");
    }
    else{
        func.getuser(mysql.format("SELECT * FROM users where id = ?", id), function(err, data){
            if(err){
                req.send(err);
            }
            else{
                if(data){
                    console.log(func.sha256(pw))
                    if(func.sha256(pw) !== data.pw){ res.send("<script>alert('ID or password does not match.');history.go(-1);</script>");}
                    else{
                        const token = jwt.sign({ user: data.id}, SECRET, { expiresIn: '1h'});
                        res.cookie('user', token);
                        res.redirect("/");
                    }
                }
                else { res.send("<script>alert('User information does not exist.');history.go(-1);</script>")}
            }
        });
    }
});

// get register page
app.get('/register', (req, res) => {
    res.render('register.ejs');
});

// register function, can't regist with "korea_pocas", 
app.post('/register', (req, res) => {
    const name = req.body.name;
    const id = req.body.id;
    const pw = req.body.pw;
    const rpw = req.body.rpw;

    if (/[A-Z]/g.test(id) || id == 'korea_pocas') { // ID가 대문자 알파벳이거나 koread_pocas 문자열과 일치하면 에러 --> 단순 case sensitive로는 우회 불가능
        // nodejs에서의 문자열 처리 관련 우회?
        res.send("This user is not allowed.").status(400);
    }
    else{
        if(name == '' || id == '' || pw == ''){
            res.send("<script>alert('Empty values must not exist');history.go(-1);</script>");
        }
        else{
            func.getuser(mysql.format("select * from users where id = ?", id), function(err, data){
                if(err){
                    res.send(err);
                }
                else{
                  if(data){
                      res.send("<script>alert('This ID is already taken.');history.go(-1);</script>");
                  }
                 else{
                    if(pw !== rpw){
                        res.send("<script>alert('Please enter the same password');history.go(-1);</script>");
                    }
                    else{
                        const params = [name.toLowerCase(), id.toLowerCase(), func.sha256(pw.toLowerCase())];
                        conn.query(mysql.format("insert into users(name, id, pw) values(?, ?, ?);", params), function(err, rows){
                            if(err) { res.send(err);}
                            else {res.redirect("/login");}
                        });
                    }
                  }
                }
            });
        }
    }
});

app.get('/raw/:filename', function(req, res){
    const file = {};
    const filename = req.params.filename;
    const filepath = `publics/uploads/${filename}`;

    try{
        func.getfile(mysql.format("select * from filelist where path = ?", filepath), function(err, data){
            if(err) {
                res.send(err);
            }
            else{
                if (data){
                    res.download(data.path);
                }else{ // getfile func에서 data가 없을 경우
                    try{
                        // file object와 filename을 포함한 Json object를 merge 한다 --> Pollution 발생
                        // Prototype pollution을 해서 무엇을 할 수있는가 ?? User의 information을 조작하여 korea_pocas로 위장한다?
                        func.merge(file, JSON.parse(`{"filename":"${filename}", "State":"Not Found"}`));
                        res.send(file);
                    } catch (e) {
                        res.send("I don't know..");
                    }
                }
            }
        });
    } catch (e) {
        res.send("I don't know..");
    }
});

//{"filename":"{test":"test213}","State":"Not Found"}
//{"filename":"t1"},{"__proto__":{"sttus":"polluted"}}
//{"__proto__":{"status":"polluted"}}
//{"filename":"t1"},{"__proto__":{"st":"t1"},"","State":"Not Found"}

app.get('/upload', function(req, res){
    res.render('upload.ejs');
});

app.post('/upload', upload.single('filezz'),function(req, res){
    try{
        conn.query(mysql.format("insert into filelist(path) values (?)", req.file.path), function(err, rows){
            if(err) {res.send(err);}
            else {res.send('Upload Success : ' + req.file.path);}
        });
    } catch (e) {
        res.send("I don't know..");
    }
})

app.get('/debug', function(req, res){
    const cook = req.cookies['user'];
    if (cook !== undefined){
        try{
            const information = jwt.verify(cook, SECRET);
            if (information['user'] == 'korea_pocas'){
                res.send(spawnSync(process.execPath, ['debug.js']).stdout.toString());
            } else {
                res.send("Debug mode off");
            }
        } catch (e) {
            res.status(401).json({ error: 'unauthorized' });
        }
    } else {
        try{
            res.send("You are not login..")
        } catch (e) {
            res.send("I don't know..")
        }
    }
})

app.get('/logout', (req, res) => {
    res.clearCookie("user");
    res.redirect("/");
});

app.listen(PORT, () => {
    console.log(`Listeing PORT ${PORT}....`);
});