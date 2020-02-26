# Kimi no Na Wa
> ## Overview 
Pandora 문제와 같은 웹 디자인과 동작이다.  

![Alt text](image01.png) 

회원가입을 하고 로그인을 하면 이번에는 NAME 파라미터가 없이 Success 파라미터만 존재한다.

![Alt text](image02.png) 

> ## Solve
이번에는 NAME파라미터가 없기 때문에 다른 방법을 이용해야했다. 여러가지 시도해보고 인젝션 취약점을  
발견하였다.  
이번에는 Registration에서 Username에 인젝션을 통해 공격을 시도할 수 있었다.  
```
' or 1=1#
```
이 공격으로 아래와 같은 결과를 얻을 수 있었다. 

![Alt text](image03.png)  
이후는 앞의 Pandora 문제와 같이 Information_schema를 통해 table_name과 column_name을 알아내어 Flag를 획득하였다.

