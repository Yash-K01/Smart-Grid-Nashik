const technicianSchema = new mongoose.Schema(
{

name:{
type:String,
required:true,
trim:true
},

education:{
type:String,
trim:true
},

experience:{
type:String,
trim:true
},

contactNumber:{
type:String,
required:true,
unique:true,
match:/^[6-9]\d{9}$/
},

email:{
type:String,
required:true,
unique:true,
lowercase:true,
trim:true,
index:true
},

location:{
type:String,
required:true,
trim:true
},

password:{
type:String,
required:true,
minlength:6,
select:false
},

isAvailable:{
type:Boolean,
default:true
},

latitude:Number,

longitude:Number,

role:{
type:String,
enum:["technician"],
default:"technician"
}

},
{
timestamps:true
});