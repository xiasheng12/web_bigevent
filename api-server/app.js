//导入express模块
const express=require('express')
//创建express服务器实例
const app=express()
//导入解决跨域问题的中间件
const cors=require('cors')
//导入表单验证中间件
const joi=require('joi')
//解析表单数据中间件
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
//注册为中间件
app.use(cors())
//导入解析token的配置文件
const config=require('./config')
//解析token的中间件
const expressJWT=require('express-jwt')
//// 使用 .unless({ path: [/^\/api\//] }) 指定哪些接口不需要进行 Token 的身份认证
app.use(expressJWT({secret:config.jwtSecreKey}).unless({path:[/^\/api\//]}))

//优化res.send()代码在处理函数中，需要多次调用 res.send() 向客户端响应 处理失败 的结果，为了简化代码，可以手动封装一个 res.cc() 函数
app.use((req,res,next)=>{
    //status为0则成功为1则失败 默认设置为1 方便处理失败的结果
    res.cc=function(err,status=1){
        res.send({
            //状态
            status,
            //状态描述 判断err是错误对象还剩字符串
            message:err instanceof Error ? err.message : err,
        })
    }
    next()
})

//定义错误级别的中间件
app.use((err,req,res,next)=>{
    try{} catch(e){  res.send(e.message)  } 
    //将错误消息返回给服务器
    if(err.name==='UnauthorizedError') return res.cc('身份认证失败！')
    //未知错误
    res.cc(err)
})
//写需求

//导入并注册路由模块
const userrouter=require('./router/user')
app.use('/api',userrouter)
//调用app.listen方法启动web服务器
app.listen(3007,()=>{
    console.log('api server running at http://127.0.0.1:3007');
})




