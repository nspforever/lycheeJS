<!doctype html>
<html>

	<head>

		<title>Admin Panel</title>
		<meta name="robots" content="noindex, nofollow">

		<style>

			body {
				color: #ffffff;
				background: #222222;
			}

			.notification {
				margin: 1em 12px;
				padding: 4px 1em;
				color: #993300;
				background: #ffeeee;
				border: 2px solid #993300;
				border-radius: 8px;
			}

			#login {
				display: block;
				margin: 15% auto;
				padding: 0;
				width: 20em;
				height: auto;
				text-align: center;
			}

			fieldset {
				margin: 2em 12px;
				padding: 1em;
				border: 2px solid #444444;
				border-radius: 8px;
			}

			#login-controls input {
				color: #ffffff;
				background: #333333;
				padding: 4px 1em;
				border: 1px solid #ffffff;
				border-radius: 8px;
				box-shadow: inset 0 0 0px #000000;
				cursor: pointer;
			}

			#login-controls input,
			#login-controls input:active,
			#login-controls input:hover {
				-ms-transition: all 500ms ease-out;
				-moz-transition: all 500ms ease-out;
				-webkit-transition: all 500ms ease-out;
				transition: all 500ms ease-out;
				outline: none;
			}

 			#login-controls input:active,
			#login-controls input:hover {
				color: #aaaaaa;
				border: 1px solid #ffffff;
				box-shadow: inset 0 0 30px #000000;
			}

		</style>

	</head>
	<body>

		<div id="login">

			<h1>Admin Panel</h1>

			<p class="notification">Please enter your credentials.</p>

			<form action="index.php" method="POST">
 
				<input type="hidden" name="sql_db" value="admin"/>

				<fieldset id="login-credentials">
					<input name="sql_user" type="text" placeholder="username"/><br>
					<input name="sql_pass" type="password" placeholder="password"/>
				</fieldset>

				<fieldset id="login-controls">
					<input type="reset" value="Reset"/>
					<input type="submit" value="Login"/>
				</fieldset>

			</form>

		</div>

	</body>
</html>

