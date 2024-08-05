import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt"; 

const app = express();
const port = 3000;
const saltRounds = 10;
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "GPA",
  password: "asdfgh@$1234",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
 
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
   
     const username=req.body.username;
     const options=req.body.options;
     const level=1;
     var password=[];
    /*console.log(options);*/
    try {
      const result=await db.query(`SELECT id,url FROM ${options[level-1]}`);
    /*  console.log(result.rows);*/
      const images=result.rows;
      res.render("registergpa.ejs",{images,username,level,options,password});
    } catch (error) {
      console.log(error);
    }
});

app.post("/submitgpa",async (req,res)=>{
 
  const username=req.body.username;
  var id=req.body.imageId;
  id=parseInt(id);
  var level=req.body.level;
  level=parseInt(level);
  level=level+1;
   
   
  
  const options = req.body.options.split(',').map(option => option.trim());
  let password = req.body.password
  .split(',')
  .map(option => option.trim())
  .filter(option => option !== '')  
  .map(option => parseInt(option));   
password.push(id);

/*console.log(password);*/

 if(level<=options.length){ 
 try {
    const result=await db.query(`SELECT id,url FROM ${options[level-1]}`);
    /*console.log(result.rows);*/
    
    const images=result.rows;
    res.render("registergpa.ejs",{images,username,level,options,password});
  } catch (error) {
    console.log(error);
  }
}else{
  var passwordString='';
  for(var i=0;i<options.length;i++){
      try {
        const result=await db.query(`SELECT message FROM ${options[i]} where id=$1`,[password[i]]);
         passwordString+=result.rows[0].message;
      } catch (error) {
        console.log(error);
      }
  }
   try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      username
    ]);

    if (checkResult.rows.length > 0) {
      res.send("Email already exists. Try logging in.");
    } else {
   /*   const result = await db.query(
        "INSERT INTO users (email, password) VALUES ($1, $2)",
        [username, passwordString]
      );
   
      res.render("secrets.ejs");*/
      bcrypt.hash(passwordString, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          console.log("Hashed Password:", hash);
          await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2)",
            [username, hash]
          );
          res.render("secrets.ejs");
        }
      });
    }
   } catch (error) {
    console.log(error);
   }

  
}
   
});
app.post("/logingpa",async (req,res)=>{
 
  const username=req.body.username;
  var id=req.body.imageId;
  id=parseInt(id);
  var level=req.body.level;
  level=parseInt(level);
  level=level+1;
   
   
  
  const options = req.body.options.split(',').map(option => option.trim());
  let password = req.body.password
  .split(',')
  .map(option => option.trim())
  .filter(option => option !== '')  
  .map(option => parseInt(option));   
password.push(id);

/*console.log(password);*/

 if(level<=options.length){ 
 try {
    const result=await db.query(`SELECT id,url FROM ${options[level-1]}`);
    /*console.log(result.rows);*/
    
    const images=result.rows;
    res.render("logingpa.ejs",{images,username,level,options,password});
  } catch (error) {
    console.log(error);
  }
}else{
  var passwordString = '';
  for (var i = 0; i < options.length; i++) {
    try {
      const result = await db.query(`SELECT message FROM ${options[i]} where id=$1`, [password[i]]);
      passwordString += result.rows[0].message;
    } catch (error) {
      console.log(error);
    }
  }
  /*console.log(passwordString);*/

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [username]);

    if (checkResult.rows.length > 0) {
      const user = checkResult.rows[0];
      const storedHashedPassword = user.password;

      /*
      if (passwordString === originalPassword) {
        res.render("secrets.ejs");
      } else {
        res.send("Incorrect password");
      }*/
        bcrypt.compare(passwordString, storedHashedPassword, (err, result) => {
          if (err) {
            console.error("Error comparing passwords:", err);
          } else {
            if (result) {
              res.render("secrets.ejs");
            } else {
              res.send("Incorrect Password");
            }
          }
        });
    } else {
      res.send("User not found");
    }
  } catch (error) {
    console.log(error);
  }
  
}
   
})

app.post("/login", async (req, res) => {
  const username=req.body.username;
  const options=req.body.options;
  const level=1;
  var password=[];
 console.log(options);
 try {
   const result=await db.query(`SELECT id,url FROM ${options[level-1]}`);
 /*  console.log(result.rows);*/
   const images=result.rows;
   res.render("logingpa.ejs",{images,username,level,options,password});
 } catch (error) {
   console.log(error);
 }
 
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
