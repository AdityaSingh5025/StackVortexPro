const jwt = require("jsonwebtoken")


exports.auth = async (req,res, next) => {

    try {
        
        const token = req.body.token || req.cookies.token || req.get("Authorization")?.replace("Bearer ", "");
        
        if(!token) {
            return res.status(401).json({
                success:false,
                message:'TOken is missing',
            });
        }
        try {
            const payload = jwt.verify(token,process.env.JWT_SECRET);
            req.user = payload;
        } catch (error) {
            return res.status(401).json({
                success:false,
                message:"Invaild token."
            })
        } 
        next();
    } catch (error) {
        console.log(error)
        return res.status(401).json({
            success:false,
            message:"Error in validating token"
        })
    }
}

exports.isStudent = async(req,res,next) => {
    try{
        // #region agent log
        fetch('http://127.0.0.1:7646/ingest/ec754675-8073-46a1-b65d-24961d47e677',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'11fc5a'},body:JSON.stringify({sessionId:'11fc5a',runId:'pre-fix',hypothesisId:'B',location:'auth.js:isStudent',message:'isStudent middleware',data:{accountType:req.user?.accountType,path:req.path,allowed:req.user?.accountType==='Student'},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        if(req.user.accountType !== "Student") {
            return res.status(401).json({
                success:false,
                message:'This is a protected route for Students only',
            });
        }
        next();
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:'User role cannot be verified, please try again'
        })
    }
}
exports.isInstructor = async(req,res,next) => {
    try{
        if(req.user.accountType !== "Instructor") {
            return res.status(401).json({
                success:false,
                message:'This is a protected route for Instructor only',
            });
        }
        next();
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:'User role cannot be verified, please try again'
        })
    }
}

exports.isAdmin = async (req, res, next) => {
    try{
           if(req.user.accountType !== "Admin") {
               return res.status(401).json({
                   success:false,
                   message:'This is a protected route for Admin only',
               });
           }
           next();
    }
    catch(error) {
       return res.status(500).json({
           success:false,
           message:'User role cannot be verified, please try again'
       })
    }
   }
