"use strict";var Bt=Object.create;var Y=Object.defineProperty;var _t=Object.getOwnPropertyDescriptor;var Mt=Object.getOwnPropertyNames,de=Object.getOwnPropertySymbols,Ht=Object.getPrototypeOf,pe=Object.prototype.hasOwnProperty,Ft=Object.prototype.propertyIsEnumerable;var ce=(e,t,r)=>t in e?Y(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,H=(e,t)=>{for(var r in t||={})pe.call(t,r)&&ce(e,r,t[r]);if(de)for(var r of de(t))Ft.call(t,r)&&ce(e,r,t[r]);return e};var Wt=(e,t,r,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let s of Mt(t))!pe.call(e,s)&&s!==r&&Y(e,s,{get:()=>t[s],enumerable:!(o=_t(t,s))||o.enumerable});return e};var u=(e,t,r)=>(r=e!=null?Bt(Ht(e)):{},Wt(t||!e||!e.__esModule?Y(r,"default",{value:e,enumerable:!0}):r,e));var a=(e,t,r)=>new Promise((o,s)=>{var n=g=>{try{m(r.next(g))}catch(v){s(v)}},d=g=>{try{m(r.throw(g))}catch(v){s(v)}},m=g=>g.done?o(g.value):Promise.resolve(g.value).then(n,d);m((r=r.apply(e,t)).next())});var le=u(require("mongoose")),Nt=u(require("dotenv"));var ue=u(require("path")),B=u(require("express")),St=u(require("morgan"));var G=class extends Error{constructor(r,o){super(r);this.statusCode=o,this.status=`${o}`.startsWith("4")?"fail":"error",this.isOperational=!0,Error.captureStackTrace(this,this.constructor)}},i=G;var Lt=e=>{let t=`Invalid ${e.path}:${e.value}`;return new i(t,400)},Jt=e=>{let r=`Duplicate field value: '${e.keyValue.name}' Please use another value`;return new i(r,400)},zt=e=>{let r=`Invalid input data. ${Object.values(e.errors).map(o=>o.message).join(". ")}`;return new i(r,400)},Vt=()=>new i("Invalid token. Please log in again",401),Qt=()=>new i("Your token has expired! Please log in again",401),Yt=(e,t,r)=>t.originalUrl.startsWith("/api")?r.status(e.statusCode).json({status:e.status,error:e,message:e.message,stack:e.stack}):(console.log("ERROR",e),r.status(e.statusCode).render("error",{title:"Something went wrong!",msg:e.message})),Gt=e=>e.status(500).json({status:"error",message:"Something went wrong"}),me=(e,t,r,o)=>e.status(o).render("error",{title:t,msg:r}),Xt=(e,t,r)=>t.originalUrl.startsWith("/api")?e.isOperational?r.status(e.statusCode).json({status:e.status,message:e.message}):(console.log("ERROR",e),Gt(r)):e.isOperational?me(r,"Something went wrong!",e.message,e.statusCode):(console.log("ERROR",e),me(r,"Something went wrong!","Please try again later",e.statusCode)),Kt=(e,t,r,o)=>{if(e.statusCode=e.statusCode||500,e.status=e.status||"error",process.env.NODE_ENV==="development")Yt(e,t,r);else if(process.env.NODE_ENV==="production"){let s=H({},e);s.message=e.message,e.name==="CastError"&&(s=Lt(e)),e.code===11e3&&(s=Jt(e)),e.name==="ValidationError"&&(s=zt(e)),e.name==="JsonWebTokenError"&&(s=Vt()),e.name==="TokenExpiredError"&&(s=Qt()),Xt(s,t,r)}},ge=Kt;var At=u(require("express-rate-limit")),kt=u(require("helmet")),Et=u(require("express-mongo-sanitize")),$t=u(require("xss-clean")),Pt=u(require("hpp")),Ot=u(require("cookie-parser")),jt=u(require("compression"));var Je=u(require("express"));var Z=u(require("multer")),K=u(require("sharp"));var F=u(require("mongoose")),fe=u(require("slugify")),R=new F.default.Schema({name:{type:String,required:[!0,"A tour must have a name"],unique:!0,trim:!0,maxlength:[40,"A tour name must have less or equal than 40 characters"],minlength:[10,"A tour name must have more or equal than 10 characters"]},slug:String,duration:{type:Number,required:[!0,"A tour must have a duration"]},maxGroupSize:{type:Number,required:[!0,"A tour must have a max group size"]},difficulty:{type:String,required:[!0,"A tour must have a difficulty"],enum:{values:["easy","medium","difficult"],message:"Difficulty is either:easy,medium,difficult "}},ratingsAverage:{type:Number,default:4.5,min:[1,"Rating must be above 1.0"],max:[5,"Rating must be above 5.0"],set:e=>Math.round(e*10)/10},ratingsQuantity:{type:Number,default:0},price:{type:Number,required:[!0,"A tour must have a price"]},priceDiscount:{type:Number,validate:{validator:function(e){return e<this.price},message:"Discount price ({VALUE}) should be below regular price"}},summary:{type:String,trim:!0,required:!0},description:{type:String,trim:!0},imageCover:{type:String,required:[!0,"A tour must have a cover image"]},images:[String],createdAt:{type:Date,default:Date.now,select:!1},startDates:[Date],secretTour:{type:Boolean,default:!1},startLocation:{type:{type:String,default:"Point",enum:["Point"]},coordinates:[Number],address:String,description:String},locations:[{type:{type:String,default:"Point",enum:["Point"]},coordinates:[Number],address:String,description:String,day:Number}],guides:[{type:F.default.Schema.Types.ObjectId,ref:"User"}]},{toJSON:{virtuals:!0},toObject:{virtuals:!0}});R.index({price:1,ratingsAverage:-1});R.index({slug:1});R.index({startLocation:"2dsphere"});R.virtual("durationWeeks").get(function(){return this.duration/7});R.virtual("reviews",{ref:"Review",foreignField:"tour",localField:"_id"});R.pre("save",function(e){this.slug=(0,fe.default)(this.name,{lower:!0}),e()});var xr=Date.now();R.pre(/^find/,function(e){this.find({secretTour:{$ne:!0}}),e()});R.pre(/^find/,function(e){this.populate({path:"guides",select:"-__v -passwordChangedAt -verifyToken"}),e()});R.pre("aggregate",function(e){let t={$match:{secretTour:{$ne:!0}}};this.pipeline().unshift(t);let r=this.pipeline().find(o=>o.$geoNear);if(r){let o=this.pipeline().findIndex(s=>s.$geoNear);this.pipeline().splice(o,1),this.pipeline().unshift(r)}e()});var Zt=F.default.model("Tour",R),p=Zt;var er=e=>(t,r,o)=>{e(t,r,o).catch(o)},l=er;var X=class{constructor(t,r){this.query=t,this.queryString=r}filter(){let t=H({},this.queryString);["page","sort","limit","fields"].forEach(s=>delete t[s]);let o=JSON.stringify(t);return o=o.replace(/\b(gte|gt|lte|lt)\b/g,s=>`$${s}`),this.query=this.query.find(JSON.parse(o)),this}sort(){if(this.queryString.sort){let t=this.queryString.sort.split(",").join(" ");this.query=this.query.sort(t)}else this.query.sort("-createdAt");return this}limitFields(){if(this.queryString.fields){let t=this.queryString.fields.split(",").join(" ");this.query=this.query.select(t)}else this.query.select("-__v");return this}paginate(){let t=this.queryString.page*1||1,r=this.queryString.limit*1||100,o=(t-1)*r;return this.query=this.query.skip(o).limit(r),this}},he=X;var x=e=>l((t,r,o)=>a(void 0,null,function*(){let s={};t.params.tourId&&(s={tour:t.params.tourId});let d=yield new he(e.find(s),t.query).filter().sort().limitFields().paginate().query;r.status(200).json({status:"success",results:d.length,data:d})})),b=(e,t)=>l((r,o,s)=>a(void 0,null,function*(){let n=e.findById(r.params.id);t&&(n=n.populate(t));let d=yield n;if(!d)return s(new i("No document found with that ID ",404));d.verifyToken=void 0,o.status(200).json({status:"success",results:d})})),S=e=>l((t,r,o)=>a(void 0,null,function*(){if(!(yield e.findByIdAndDelete(t.params.id)))return o(new i("No document found with that ID ",404));r.status(204).json({status:"success",data:null})})),A=e=>l((t,r,o)=>a(void 0,null,function*(){let s=yield e.findByIdAndUpdate(t.params.id,t.body,{new:!0,runValidators:!0}),n=e.modelName.toLowerCase();if(!s)return o(new i("No document found with that ID ",404));r.status(200).json({status:"success",data:{[n]:s}})})),P=e=>l((t,r,o)=>a(void 0,null,function*(){let s=yield e.create(t.body),n=e.modelName.toLowerCase();r.status(201).json({status:"success",data:{[n]:s}})}));var tr=Z.default.memoryStorage(),rr=(e,t,r)=>{t.mimetype.startsWith("image")?r(null,!0):r(new i("Not an image ! Please upload only images.",400),!1)},or=(0,Z.default)({storage:tr,fileFilter:rr}),ye=or.fields([{name:"imageCover",maxCount:1},{name:"images",maxCount:3}]),we=l((e,t,r)=>a(void 0,null,function*(){let o=e.files.imageCover,s=e.files.images;o&&(e.body.imageCover=`tour-${e.params.id}-${Date.now()}-cover.jpeg`,yield(0,K.default)(e.files.imageCover[0].buffer).resize(2e3,1333).toFormat("jpeg").jpeg({quality:90}).toFile(`dist/public/img/tours/${e.body.imageCover}`)),s&&(e.body.images=[],yield Promise.all(e.files.images.map((n,d)=>a(void 0,null,function*(){let m=`tour-${e.params.id}-${Date.now()}-${d+1}.jpeg`;yield(0,K.default)(n.buffer).resize(2e3,1333).toFormat("jpeg").jpeg({quality:90}).toFile(`dist/public/img/tours/${m}`),e.body.images.push(m)})))),r()})),ve=(e,t,r)=>{e.query.limit="5",e.query.sort="-ratingsAverage,price",e.query.fields="name,price,ratingsAverage,summary,difficulty,duration",r()},ee=x(p),Re=b(p,{path:"reviews"}),Te=P(p),Ce=A(p),xe=S(p),be=l((e,t,r)=>a(void 0,null,function*(){let o=yield p.aggregate([{$match:{ratingsAverage:{$gte:4.5}}},{$group:{_id:{$toUpper:"$difficulty"},numTours:{$sum:1},numRatings:{$sum:"$ratingsQuantity"},avgRating:{$avg:"$ratingsAverage"},avgPrice:{$avg:"$price"},minPrice:{$min:"$price"},maxPrice:{$max:"$price"}}},{$sort:{avgPrice:1}}]);t.status(200).json({status:"success",data:o})})),Se=l((e,t,r)=>a(void 0,null,function*(){let o=+e.params.year,s=yield p.aggregate([{$unwind:"$startDates"},{$match:{startDates:{$gte:new Date(`${o}-01-01`),$lte:new Date(`${o}-12-31`)}}},{$group:{_id:{$month:"$startDates"},numTourStarts:{$sum:1},tours:{$push:"$name"}}},{$addFields:{month:"$_id"}},{$project:{_id:0}},{$sort:{numTourStarts:-1}},{$limit:12}]);t.status(200).json({status:"success",data:s})})),Ae=l((e,t,r)=>a(void 0,null,function*(){let{distance:o,latlng:s,unit:n}=e.params,[d,m]=s.split(","),g=n==="mi"?+o/3963.2:+o/6378.1;(!d||!m)&&r(new i("Please provide latitude and longitude in the format lat,lng",400));let v=yield p.find({startLocation:{$geoWithin:{$centerSphere:[[m,d],g]}}});t.status(200).json({status:"success",results:v.length,data:{data:v}})})),ke=l((e,t,r)=>a(void 0,null,function*(){let{latlng:o,unit:s}=e.params,[n,d]=o.split(","),m=s==="mi"?621371e-9:.001;(!n||!d)&&new i("Please provide latitude and longitude in the format lat,lng",400);let g=yield p.aggregate([{$geoNear:{near:{type:"Point",coordinates:[+d,+n]},distanceField:"distance",distanceMultiplier:m}},{$project:{distance:1,name:1}}]);t.status(200).json({status:"success",data:{data:g}})}));var se=u(require("crypto")),L=u(require("jsonwebtoken"));var I=u(require("crypto")),te=u(require("mongoose")),Ee=u(require("validator")),re=u(require("bcryptjs"));var k=new te.default.Schema({name:{type:String,required:[!0,"Please tell us your name"]},email:{type:String,required:[!0,"Please provide your email"],unique:!0,lowercase:!0,validate:[Ee.default.isEmail,"Please provide a valid email"]},photo:{type:String,default:"default.jpg"},role:{type:String,enum:["user","guide","lead-guide","admin"],default:"user"},password:{type:String,required:[!0,"Please provide your password"],minlength:8,select:!1},passwordConfirm:{type:String,required:[!0,"Please confirm your password"],validate:{validator:function(e){return e===this.password},message:"Passwords are not the same"}},passwordChangedAt:Date,passwordResetToken:String,passwordResetExpires:Date,active:{type:Boolean,default:!0,select:!1},verifyToken:String,verified:{type:Boolean,default:!1,select:!1}});k.pre("save",function(e){return a(this,null,function*(){if(!this.isModified("password"))return e();this.password=yield re.default.hash(this.password,12),this.passwordConfirm=void 0,e()})});k.pre("save",function(e){if(!this.isModified("password")||this.isNew)return e();this.passwordChangedAt=Date.now()-1e3,e()});k.pre(/^find/,function(e){this.find({active:{$ne:!1}}),e()});k.methods.correctPassword=function(e,t){return a(this,null,function*(){return yield re.default.compare(e,t)})};k.methods.changesPasswordAfter=function(e){if(this.passwordChangedAt){let t=this.passwordChangedAt.getTime()/1e3;return e<t}return!1};k.methods.createPasswordResetToken=function(){let e=I.default.randomBytes(32).toString("hex");return this.passwordResetToken=I.default.createHash("sha256").update(e).digest("hex"),this.passwordResetExpires=Date.now()+10*60*1e3,e};k.methods.verifyEmailToken=function(){let e=I.default.randomBytes(32).toString("hex");return this.verifyToken=I.default.createHash("sha256").update(e).digest("hex"),e};var nr=te.default.model("User",k),f=nr;var oe=u(require("nodemailer")),$e=u(require("pug")),Pe=require("html-to-text");var D=class{constructor(t,r){this.to=t.email,this.firstName=t.name.split(" ")[0],this.url=r,this.from=`Chamara Perera <${process.env.EMAIL_FROM}>`}newTransport(){return process.env.NODE_ENV==="production"?oe.default.createTransport({service:"SendInBlue",auth:{user:process.env.SENDINBLUE_USERNAME,pass:process.env.SENDINBLUE_PASSWORD}}):oe.default.createTransport({host:process.env.EMAIL_HOST,port:Number(process.env.EMAIL_PORT),auth:{user:process.env.EMAIL_USERNAME,pass:process.env.EMAIL_PASSWORD}})}send(t,r){return a(this,null,function*(){let o=$e.default.renderFile(`${__dirname}/views/email/${t}.pug`,{firstName:this.firstName,url:this.url,subject:r}),s={from:this.from,to:this.to,subject:r,html:o,text:(0,Pe.htmlToText)(o)};yield this.newTransport().sendMail(s)})}sendWelcome(){return a(this,null,function*(){yield this.send("Welcome","Welcome to the Nature Sights Family")})}sendPasswordReset(){return a(this,null,function*(){yield this.send("passwordReset","Your password reset token (valid for only 10 minutes)")})}};var N=u(require("mongoose"));var O=new N.default.Schema({review:{type:String,required:[!0,"Review cannot be empty"]},rating:{type:Number,min:1,max:5,required:[!0,"Rating cannot be empty"]},createdAt:{type:Date,default:Date.now()},tour:{type:N.default.Schema.Types.ObjectId,ref:"Tour",required:[!0,"Review must belong to a tour"]},user:{type:N.default.Schema.Types.ObjectId,ref:"User",required:[!0,"Review must belong to a user"]}},{toJSON:{virtuals:!0},toObject:{virtuals:!0}});O.index({tour:1,user:1},{unique:!0});O.pre(/^find/,function(e){this.populate({path:"user",select:"name photo"}),e()});O.statics.calcAverageRatings=function(e){return a(this,null,function*(){let t=yield this.aggregate([{$match:{tour:e}},{$group:{_id:"$tour",nRating:{$sum:1},avgRating:{$avg:"$rating"}}}]);t.length>0?yield p.findByIdAndUpdate(e,{ratingsQuantity:t[0].nRating,ratingsAverage:t[0].avgRating}):yield p.findByIdAndUpdate(e,{ratingsQuantity:0,ratingsAverage:4.5})})};O.post("save",function(){this.constructor.calcAverageRatings(this.tour)});O.post(/^findOneAnd/,function(e){e.constructor.calcAverageRatings(e.tour)});var ar=N.default.model("Review",O),E=ar;var ir=e=>{let t=process.env.JWT_SECRET;if(!t)throw new Error("JWT secret is not defined");return L.default.sign({id:e},t,{expiresIn:process.env.JWT_EXPIRES_IN})},J=(e,t,r)=>{let o=ir(e._id),s={expires:new Date(Date.now()+Number(process.env.JWT_COOKIE_EXPIRES_IN)*24*60*60*1e3),httpOnly:!0};process.env.NODE_ENV==="production"&&Object.assign(s,{secure:!0}),r.cookie("jwt",o,s),e.password=void 0,e.verifyToken=void 0,r.status(t).json({status:"success",token:o,data:{user:e}})},Oe=l((e,t,r)=>a(void 0,null,function*(){let o=yield f.create({name:e.body.name,email:e.body.email,password:e.body.password,passwordConfirm:e.body.passwordConfirm,passwordChangedAt:e.body.passwordChangedAt,role:e.body.role,photo:e.body.photo}),s=`${e.protocol}://${e.get("host")}/me`;yield new D(o,s).sendWelcome();let n=o.verifyEmailToken();yield o.save({validateModifiedOnly:!0});let m=`Please go to this link to verify your email :${`${e.protocol}://${e.get("host")}/api/v1/users/verifyEmail/${n}`}.
 If you didn't create an account,
  please ignore this email`;try{}catch(g){return o.verifyToken=void 0,yield o.save({validateModifiedOnly:!0}),r(new i("There was an error sending the email. Try again later!",500))}J(o,201,t)})),je=l((e,t,r)=>a(void 0,null,function*(){let o=se.default.createHash("sha256").update(e.params.token).digest("hex"),s=yield f.findOne({verifyToken:o}).select("+verified");if(!s)return r(new i("The token is invalid or has expired",400));if(s.verified)return r(new i("Email address has already been verified",400));s.verified=!0,yield s.save({validateModifiedOnly:!0}),t.status(200).json({status:"success",message:"Email address has been verified"})})),Ie=l((e,t,r)=>a(void 0,null,function*(){let{email:o,password:s}=e.body;if(!o||!s)return r(new i("Please provide email and password",400));let n=yield f.findOne({email:o}).select("+password");if(!n||!(yield n.correctPassword(s,n.password)))return r(new i("Incorrect email or password",401));J(n,200,t)})),De=(e,t,r)=>{t.clearCookie("jwt"),t.status(200).json({status:"success"})},h=l((e,t,r)=>a(void 0,null,function*(){let o;if(e.headers.authorization&&e.headers.authorization.startsWith("Bearer")?o=e.headers.authorization.split(" ")[1]:e.cookies.jwt&&(o=e.cookies.jwt),!o)return r(new i("You are not logged in! Please log in to get access",401));let n=yield((m,g)=>new Promise((v,_)=>{L.default.verify(m,g,{},(M,qt)=>{M?_(M):v(qt)})}))(o,process.env.JWT_SECRET),d=yield f.findById(n.id);if(!d)return r(new i("The user belonging to this token  does no longer exist",401));if(d.changesPasswordAfter(n.iat))return r(new i("User recently changed password! Please log in again",401));e.user=d,t.locals.user=d,r()})),z=(e,t,r)=>a(void 0,null,function*(){try{if(e.cookies.jwt){let s=yield((d,m)=>new Promise((g,v)=>{L.default.verify(d,m,{},(_,M)=>{_?v(_):g(M)})}))(e.cookies.jwt,process.env.JWT_SECRET),n=yield f.findById(s.id);return!n||n.changesPasswordAfter(s.iat)||(t.locals.user=n),r()}r()}catch(o){return r()}}),w=(...e)=>(t,r,o)=>{if(!e.includes(t.user.role))return o(new i("You do not have permission to perform this action",403));o()},Ne=l((e,t,r)=>a(void 0,null,function*(){let o=yield f.findOne({email:e.body.email});if(!o)return r(new i("There is no user with email address",404));let s=o.createPasswordResetToken();yield o.save({validateModifiedOnly:!0});try{let n=`${e.protocol}://${e.get("host")}/api/v1/users/resetPassword/${s}`;yield new D(o,n).sendPasswordReset(),t.status(200).json({status:"success",message:"Token sent to email"})}catch(n){return o.passwordResetToken=void 0,o.passwordResetExpires=void 0,yield o.save({validateModifiedOnly:!0}),r(new i("There was an error sending the email. Try again later!",500))}})),Ue=l((e,t,r)=>a(void 0,null,function*(){let o=se.default.createHash("sha256").update(e.params.token).digest("hex"),s=yield f.findOne({passwordResetToken:o,passwordResetExpires:{$gt:Date.now()}});if(!s)return r(new i("The token is invalid or has expired",400));s.password=e.body.password,s.passwordConfirm=e.body.passwordConfirm,s.passwordResetToken=void 0,s.passwordResetExpires=void 0,yield s.save(),J(s,200,t)})),qe=l((e,t,r)=>a(void 0,null,function*(){let o=yield f.findById(e.user._id).select("+password");if(!o)return r(new i("The user does not exist",400));if(!(yield o.correctPassword(e.body.passwordCurrent,o.password)))return r(new i("The password is wrong",401));o.password=e.body.password,o.passwordConfirm=e.body.passwordConfirm,yield o.save(),J(o,200,t)})),ne=l((e,t,r)=>a(void 0,null,function*(){let o=yield E.findById(e.params.id);e.user.role!=="admin"&&e.user.id!==(o==null?void 0:o.user.id)&&r(new i("Not Authorized. You cannot update or delete review written by someone else",403)),r()}));var Le=u(require("express"));var Be=x(E),_e=(e,t,r)=>{e.body.tour||(e.body.tour=e.params.tourId),e.body.user||(e.body.user=e.user.id),r()},Me=b(E),He=P(E),Fe=A(E),We=S(E);var V=Le.default.Router({mergeParams:!0});V.use(h);V.route("/").get(Be).post(w("user"),_e,He);V.route("/:id").get(Me).patch(w("user","admin"),ne,Fe).delete(w("user","admin"),ne,We);var Q=V;var T=Je.default.Router();T.use("/:tourId/reviews",Q);T.route("/tour-stats").get(be);T.route("/monthly-plan/:year").get(h,w("admin","lead-guide","guide"),Se);T.route("/tours-within/:distance/center/:latlng/unit/:unit").get(Ae);T.route("/distances/:latlng/unit/:unit").get(ke);T.route("/top-5-cheap").get(ve,ee);T.route("/").get(ee).post(h,w("admin","lead-guide"),Te);T.route("/:id").get(Re).patch(h,w("admin","lead-guide"),ye,we,Ce).delete(h,w("admin","lead-guide"),xe);var ze=T;var ot=u(require("express"));var ae=u(require("multer")),Ve=u(require("sharp"));var lr=ae.default.memoryStorage(),dr=(e,t,r)=>{t.mimetype.startsWith("image")?r(null,!0):r(new i("Not an image ! Please upload only images.",400),!1)},cr=(0,ae.default)({storage:lr,fileFilter:dr}),Qe=cr.single("photo"),Ye=l((e,t,r)=>a(void 0,null,function*(){if(!e.file)return r();e.file.filename=`user-${e.user.id}-${Date.now()}.jpeg`,yield(0,Ve.default)(e.file.buffer).resize(500,500).toFormat("jpeg").jpeg({quality:90}).toFile(`dist/public/img/users/${e.file.filename}`),r()})),pr=(e,...t)=>{let r={},o=[];return Object.keys(e).forEach(s=>{t.includes(s)?r[s]=e[s]:o.push(s)}),{allowed:r,notAllowed:o}},Ge=x(f),Xe=l((e,t,r)=>a(void 0,null,function*(){if(e.body.password||e.body.passwordConfirm)return r(new i("This route is not for password updates.Please use /updateMyPassword",400));let o=pr(e.body,"name","email");e.file&&(o.allowed.photo=e.file.filename);let{allowed:s,notAllowed:n}=o;Object.keys(s).length===0&&n.length>0&&t.status(400).json({status:"fail",message:`Not allowed fields found: ${n.join(", ")}`});let d=yield f.findByIdAndUpdate(e.user.id,s,{new:!0,runValidators:!0});n.length>0?t.status(400).json({status:"partial",message:`Unable to update these fields: ${n.join(", ")}`,data:{user:d}}):t.status(200).json({status:"success",data:{user:d}})})),Ke=(e,t,r)=>{e.params.id=e.user.id,r()},Ze=l((e,t,r)=>a(void 0,null,function*(){yield f.findByIdAndUpdate(e.user.id,{active:!1}),t.status(204).json({status:"success",data:null})})),et=(e,t)=>{t.status(500).json({status:"error",message:"This route is not not defined. Please use /signup instead "})},ie=b(f),tt=A(f),rt=S(f);var y=ot.default.Router();y.post("/signup",Oe);y.get("/verifyEmail/:token",je);y.post("/login",Ie);y.get("/logout",De);y.post("/forgotPassword",Ne);y.patch("/resetPassword/:token",Ue);y.use(h);y.get("/me",Ke,ie);y.patch("/updateMyPassword",qe);y.patch("/updateMe",Qe,Ye,Xe);y.delete("/deleteMe",Ze);y.use(w("admin"));y.route("/").get(Ge).post(et);y.route("/:id").get(ie).patch(tt).delete(rt);var st=y;var Tt=u(require("express"));var q=u(require("mongoose")),nt=new q.default.Schema({tour:{type:q.default.Schema.Types.ObjectId,ref:"Tour",required:[!0,"Booking must belong to a tour"]},user:{type:q.default.Schema.Types.ObjectId,ref:"User",required:[!0,"Booking must belong to a user"]},price:{type:Number,required:[!0,"Booking must have a price"]},createdAt:{type:Date,default:Date.now()},paid:{type:Boolean,default:!0}});nt.pre(/^find/,function(e){this.populate("user").populate({path:"tour",select:"name"}),e()});var gr=q.default.model("Booking",nt),C=gr;var at=l((e,t,r)=>a(void 0,null,function*(){let o=yield p.find();t.status(200).render("overview",{title:"All tours",tours:o})})),it=l((e,t,r)=>a(void 0,null,function*(){let o=yield p.findOne({slug:e.params.slug}).populate({path:"reviews",select:"review rating user"});if(!o)return r(new i("There is no tour with that name.",404));t.status(200).render("tour",{title:`${o.name} tour`,tour:o})})),ut=(e,t)=>{t.status(200).render("login",{title:"Log into your account"})},lt=(e,t)=>{t.status(200).render("signup",{title:"Signup"})},dt=(e,t)=>{t.status(200).render("account",{title:"Your account"})},ct=l((e,t,r)=>a(void 0,null,function*(){let s=(yield C.find({user:e.user.id})).map(d=>d.tour),n=yield p.find({_id:{$in:s}});t.status(200).render("overview",{title:"My Tours",tours:n})}));var pt=u(require("stripe"));var mt=l((e,t,r)=>a(void 0,null,function*(){let o=new pt.default(process.env.STRIPE_SECRET_KEY,{apiVersion:"2022-11-15"}),s=yield p.findById(e.params.tourId);if(s){let n=yield o.checkout.sessions.create({line_items:[{quantity:1,price_data:{currency:"aud",unit_amount:s.price*100,product_data:{name:`${s.name} Tour`,description:s.summary,images:[`https://www.natours.dev/img/tours/${s.imageCover}`]}}}],mode:"payment",success_url:`${e.protocol}://${e.get("host")}/?tour=${e.params.tourId}&user=${e.user.id}&price=${s.price}`,cancel_url:`${e.protocol}://${e.get("host")}/tour/${s.slug}`,customer_email:e.user.email,client_reference_id:e.params.tourId});t.status(200).json({status:"success",session:n})}})),gt=l((e,t,r)=>a(void 0,null,function*(){let{tour:o,user:s,price:n}=e.query;if(!o||!s||!n)return r();e.body.tour=o,e.body.user=s,e.body.price=n,yield C.create({tour:o,user:s,price:n}),t.redirect(e.originalUrl.split("?")[0])})),ft=P(C),ht=x(C),yt=b(C),wt=A(C),vt=S(C);var $=Tt.default.Router();$.get("/",gt,z,at);$.get("/tour/:slug",z,it);$.get("/login",z,ut);$.get("/signup",lt);$.get("/me",h,dt);$.get("/my-tours",h,ct);var Ct=$;var xt=u(require("express"));var j=xt.default.Router();j.use(h);j.get("/checkout-session/:tourId",h,mt);j.use(w("lead-guide","admin"));j.route("/").get(ht).post(ft);j.route("/:id").get(yt).patch(wt).delete(vt);var bt=j;var c=(0,B.default)();c.set("view engine","pug");c.set("views",ue.default.join(__dirname,"views"));c.use(B.default.static(ue.default.join(__dirname,"public")));c.use(kt.default.crossOriginResourcePolicy({policy:"same-origin"}));process.env.NODE_ENV==="development"&&c.use((0,St.default)("dev"));var hr=(0,At.default)({max:100,windowMs:60*60*1e3,message:"Too many request from this IP,please try again in an hour"});c.use("/api",hr);c.use(B.default.json({limit:"10kb"}));c.use((0,Ot.default)());c.use(B.default.urlencoded({extended:!0,limit:"10kb"}));c.use((0,Et.default)());c.use((0,$t.default)());c.use((0,Pt.default)({whitelist:["duration","ratingsQuantity","ratingsAverage","maxGroupSize","difficulty","price"]}));c.use((0,jt.default)());c.use((e,t,r)=>{e.RequestTime=new Date().toISOString(),r()});c.use("/",Ct);c.use("/api/v1/tours",ze);c.use("/api/v1/users",st);c.use("/api/v1/reviews",Q);c.use("/api/v1/bookings",bt);c.all("*",(e,t,r)=>{r(new i(`Can't find ${e.originalUrl} on this server!`,404))});c.use(ge);var It=c;process.on("uncaughtException",e=>{console.log(e.name,e.message),console.log("UNCAUGHT EXCEPTION! Shutting down..."),process.exit(1)});Nt.default.config({path:"./.env"});var Ut="";process.env.DATABASE&&process.env.DATABASE_PASSWORD&&(Ut=process.env.DATABASE.replace("<PASSWORD>",process.env.DATABASE_PASSWORD));le.default.set("strictQuery",!0);le.default.connect(Ut).then(()=>{console.log("DB connection successful")});var Dt=process.env.PORT||3e3,yr=It.listen(Dt,()=>console.log(`App running on ${Dt}...`));process.on("unhandledRejection",e=>{console.log(e.name,e.message),console.log("UNHANDLED REJECTION! Shutting down..."),yr.close(()=>process.exit(1))});
