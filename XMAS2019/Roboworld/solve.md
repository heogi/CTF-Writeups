# Roboworld
> ## Overview  

leak.py  

```python
from flask import Flask, render_template, request, session, redirect
import os
import requests
from captcha import verifyCaptchaValue

app = Flask(__name__)

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/login', methods=['POST'])
def login():
    username = request.form.get('user')
    password = request.form.get('pass')
    captchaToken = request.form.get('captcha_verification_value')

    privKey = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" #redacted
    r = requests.get('http://127.0.0.1:{}/captchaVerify?captchaUserValue={}&privateKey={}'.format(str(port), captchaToken, privKey))
    #backdoored ;)))
    if username == "backd00r" and password == "catsrcool" and r.content == b'allow':
        session['logged'] = True
        return redirect('//redacted//')
    else:
        return "login failed"


@app.route('/captchaVerify')
def captchaVerify():
    #only 127.0.0.1 has access
    if request.remote_addr != "127.0.0.1":
        return "Access denied"

    token = request.args.get('captchaUserValue')
    privKey = request.args.get('privateKey')
    #TODO: remove debugging privkey for testing: 8EE86735658A9CE426EAF4E26BB0450E from captcha verification system
    if(verifyCaptchaValue(token, privKey)):
        return str("allow")
    else:
        return str("deny")
```
크게 /login과 /capchaVerify 경로로 라우팅되어서 각각 login함수와 captchaVerify함수를 거치게 된다.  
> ## login()  
login 함수에서는 username, password, captchaToken을 받아서 /capchaVerify 경로로 이동한다.  
이후 입력한 username=backd00r 이고 password=catsrcool 이고 response에 allow가 있으면 로그인이되어 특정 경로로 redirect 한다.  
> ## captcahVerify()   
capchaVerify 함수에서는 remote_addr를 검사하고 인자로 넘어오는 token과 privKey를 받고 verifyCaptchaValue() 함수를 실행시킨다. 그리고 결과에따라 allow와 deny를 반환한다.  
> ## solve  
captcahVerify() 함수에서 verifyCaptchaValue() 함수의 동작을 알지 못하지만 token값과 privKey값을 통해 무언가를 한다. 주석에 디버깅용 privkey가 존재한다.  
몇번의 실험을 통해 디버깅용 privkey에서는 어떤 token이든 allow를 반환한다는걸 봤다.  
login() 소스에서 보면 알겠지만 privkey는 알 수가 없고 바꿀 수도 없다.  
그래서 captchaToken을 통해 디버깅용 privkey값까지 입력을 했다.  
그러면 요청하는 url은 이렇게 될것이다.
```html  
http://127.0.0.1:{}/captchaVerify?captchaUserValue=heogi&privateKey=8EE86735658A9CE426EAF4E26BB0450E&privateKey=?????
```
이를 통해 앞의 privateKey값이 적용되어 allow를 반환하게 된다.


