# Pandora
> ## Overview 

![Alt text](image1.png)
회원가입을 하고 로그인하면 가입한 ID로 NAME 파라미터에 입력이 되어있다.  
먼저 여러 메뉴를 클릭해보았지만 별다른 동작이 없었다.

>## Solve  
NAME 파라미터가 인젝션에 취약하다.
UNION을 통해 Information_schema를 조회하여 table_name, column_name등을 조회하면 Flag를 발견할 수 있다.