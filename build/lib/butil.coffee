###*
# Basic tools
# @date 2014-12-2 15:10:14
# @author pjg <iampjg@gmail.com>
# @link http://pjg.pw
# @version $Id$
###

fs      = require 'fs'
path    = require 'path'
_       = require 'lodash'
gutil   = require 'gulp-util'
color   = gutil.colors
_ = require "lodash"
_url = require "url"
crypto = require "crypto"
http = require "http"
https = require "https"
queryStr = require "querystring"


Tools = {}
# md5 hash
Tools.md5 = (text) ->
    crypto.createHash('md5').update(text).digest('hex')

# 错误报警,beep响两声
Tools.errrHandler = (e) ->
    gutil.beep()
    gutil.beep()
    gutil.log e

###
# make dir
###
Tools.mkdirsSync = (dirpath, mode)->
    if fs.existsSync(dirpath)
        return true
    else
        if Tools.mkdirsSync path.dirname(dirpath), mode
            fs.mkdirSync(dirpath, mode)
            return true
###
# make dirs
###
Tools.mkdirs = (dirpath, mode, callback)->
    fs.exists dirpath,(exists)->
        if exists
            callback(exists)
        else
            # Try made the parent's dir，then make the current dir
            mkdirs path.dirname(dirpath), mode, ->
                fs.mkdir dirpath, mode, callback

###
# obj mixin function
# Example:
# food = { 'key': 'apple' }
# food2 = { 'name': 'banana', 'type': 'fruit' }
# console.log objMixin(food2,food)
# console.log objMixin(food,food2)
###

Tools.objMixin = _.partialRight _.assign, (a, b) ->
    val = if (typeof a is 'undefined') then b else a
    return val

# 获取文件
Tools.getFileSync = (file, encoding)->
    _encoding = encoding or 'utf8'
    fileCon = ''
    if fs.existsSync(file)
        stats = fs.statSync(file)
        if stats.isFile()
            fileCon = fs.readFileSync(file, _encoding)
    return fileCon

# 获取文件json对象
Tools.getJSONSync = (file) ->
    fileCon = Tools.getFileSync(file)
    data = null
    if fileCon
        fileCon = fileCon.replace(/\/\/[^\n]*/g, '')
        try
            data = JSON.parse(fileCon)
        catch e
            console.log e
            return null
    return data

# 发送get请求
Tools.getUrl = (url, callback, errback)->
    resultData = ''
    option = _url.parse(url)
    HttpType = if option.protocol.indexOf('https') > -1 then https else http
    HttpType.get url,(res)->
        res.setEncoding('utf8')
        res.on 'data',(data)->
            resultData += data
        res.on 'end',->
            callback && callback(resultData);          
    .on 'error',(e)->
        errback && errback(e.message)

# 发送post请求
Tools.postUrl = (url, data, headers, callback, errback)->
    resultData = ''
    option = _url.parse(url)
    sendData = if _.isObject(data) then queryStr.stringify(data) else data

    option.method = 'POST'
    option.headers = 
        "Content-Type": 'application/x-www-form-urlencoded' 
        "Content-Length": sendData.length  

    if headers
        option.headers = _.assign(option.headers, headers)
    
    HttpType = if option.protocol is 'http' then http else https
    req = HttpType.request option, (res) ->
        res.setEncoding('utf8');
        res.on 'data', (data)->
            resultData += data;
        res.on 'end',->
            callback and callback(resultData)     

    req.on 'error',(e)->
        errback and errback(e.message)
    req.write sendData + "\n"
    req.end()

# 获取远程json对象
Tools.getJSON = (url, callback, errback)->
    Tools.getUrl url, (data)->
        json = null
        try
            json = JSON.parse(data)
        catch e
            #console.log(e)
            errback and errback(e)
            return false
        
        callback and callback(json)
    , errback

# 递归执行代码
# deepFunc: 单项值、回调
# cumulateFunc: 单项结果，单项值、deep
Tools.deepDo = (list, deepFunc, cumulateFunc, callback, deep)->
    deep = deep or 0
    if not list[deep]
        callback && callback()
        return
    
    deepFunc list[deep], (result)->
        if cumulateFunc
            cumulateFunc(result, list[deep], deep)
        # 递归
        if deep + 1 < list.length
            Tools.deepDo(list, deepFunc, cumulateFunc, callback, deep + 1)
        else 
            callback && callback() 

# 执行命令
Tools.exec = (command, callback)->
    exec command,(error, stdout, stderr)->
        # console.log(command + ' 执行中...')
        if stdout
            console.log('exec stdout: ' + stdout)
        if stderr
            console.log('exec stderr: ' + stderr)
        if error
            console.log('exec error: ' + error)
        # console.log(command + ' 执行完毕！')
        callback && callback() 


module.exports = Tools