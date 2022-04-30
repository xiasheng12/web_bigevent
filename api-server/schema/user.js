//导入表单验证模块
const joi=require('joi')
/**
* string() 值必须是字符串
* alphanum() 值只能是包含 a-zA-Z0-9 的字符串
* min(length) 最小长度
* max(length) 最大长度
* required() 值是必填项，不能为 undefined
* pattern(正则表达式) 值必须符合正则表达式的规则
*/
//用户名的验证规则 字符串a-zA-Z0-9最小一个最大10个必须填
const Username=joi.string().alphanum().min(1).max(10).required()
//密码验证规则
const Password=joi.string().pattern(/^.{6,18}$/).required()
//email验证规则
const email=joi.string().email().required()
//注册和登录表单的验证规则对象
exports.reguserSchema={
    //表示需要对req.body中的数据进行验证
    body:{
        //要跟body里面的键名一样
        Username,
        Password,
        email,
    },
}


