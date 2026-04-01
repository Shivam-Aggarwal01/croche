const auth=require('./routes/authRoutes');
console.log(auth.stack.filter(r=>r.route).map(r=>({path:r.route.path, methods:r.route.methods})));