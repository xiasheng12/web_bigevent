//导入数据库操作模块
const db=require('../db/index')
//定义一个查询数据库的sql语句
const selectSql='select * from ev_users where username=?'
//导入加密模块
const bcrypt=require('bcryptjs')
//导入生成token字符串包
const jwt=require('jsonwebtoken')
//导入配置文件
const config=require('../config')
exports.regUser=(req,res)=>{
    //获取到客户端传来的数据
    const body=req.body
    //判断数据是否为空
    if(!body.Username||!body.Password||!body.email){
        return res.cc('用户名,密码或邮箱不能为空！')
    }
    //判断用户名是否被注册
    db.query(selectSql,[body.Username],(err,results)=>{
        //数据库使用失败则打印错误消息
        if(err) return res.send({status:1,message:err.message})
        //判断用户名是否被注册
        if(results.length>0){
            return res.cc('该用户名已经被占用，请更换一个！')
        }
       const selectemailSql='select * from ev_users where email=?'
       db.query(selectemailSql,[body.email],(err,results)=>{
            //数据库使用失败则打印错误消息
            if(err) return res.send({status:1,message:err.message})
            //判断邮箱是否被注册
            if(results.length>0){
                return res.cc('该邮箱已被使用，请更换一个！')
            }
            //对用户密码进行bcrypt加密 返回值是加密之后的密码字符串
            body.Password=bcrypt.hashSync(body.Password,10)
            //可用则添加到数据库
            const appendSql='insert into ev_users set?'
            db.query(appendSql,{username:body.Username,password:body.Password,email:body.email},(err,results)=>{
                //添加失败则打印失败消息
                if(err) res.send({status:1,message:err.message})
                //sql语句执行成功但是数据库行数没有添加也是失败
                if(results.affectedRows!==1){
                    return res.cc('注册用户失败，请稍后再试！')
                }
                res.cc('注册成功,请登录！',0)
            })
        })
    })
}
exports.login=(req,res)=>{
    //通过req.query获取客户端通过查询字符串 发送到服务器的数据
    const body=req.query
    if(!body.Username||!body.Password){
        return res.cc('用户名,密码不能为空！')
    }
    db.query(selectSql,[body.Username],(err,results)=>{
        if(err) return res.send({status:1,message:err.message})
        //判断用户名是否被注册
        if(results.length===0){
            return res.cc('该用户还没有注册，请注册后再登录！')
        }else if(results.length!==1){
            return res.cc('登录失败！')
        }
        //拿着用户输入的密码和数据库密码进行比较 true为正确
        const compareResult=bcrypt.compareSync(body.Password,results[0].password)
        if(!compareResult){
            return res.cc('密码错误，登录失败！')
        }
        const user={...results[0],Password:'',user_pic:''}
        const tokenStr=jwt.sign(user,config.jwtSecreKey,{
            expiresIn:'10',
        })
        res.send({
            status:0,
            message:'登录成功！',
            //为了方便客户端使用token 在服务器端直接拼接上bearer的前缀
            token:'Bearer'+tokenStr,
        })
    })
    // res.send({
    //     status:0,//0表示请求成功 1表示请求失败
    //     msg:'GET 请求成功！', //状态描述
    //     data:query //响应给客户端的数据
    // })
}