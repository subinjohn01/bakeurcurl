const fs = require('fs');

// 1. Update User.js to include skills array
const userModelPath = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/backend/models/User.js';
let userModel = fs.readFileSync(userModelPath, 'utf8');
if (!userModel.includes('skills: [')) {
  userModel = userModel.replace(
    "specialization: {\n      type: String,\n      default: '',\n    },",
    "specialization: {\n      type: String,\n      default: '',\n    },\n    skills: {\n      type: [String],\n      default: [],\n    },"
  );
  fs.writeFileSync(userModelPath, userModel, 'utf8');
  console.log('Updated User.js model with skills array');
}

// 2. Update staffController.js to support skills
const staffCtrlPath = 'C:/Users/Subin/.gemini/antigravity/scratch/curlco-salon/backend/controllers/staffController.js';
let staffCtrl = fs.readFileSync(staffCtrlPath, 'utf8');
staffCtrl = staffCtrl.replace(
  ".select('name email avatar specialization bio')",
  ".select('name email phone avatar specialization bio skills isActive')"
);
staffCtrl = staffCtrl.replace(
  "const { name, email, password, phone, specialization, bio, avatar } = req.body;",
  "const { name, email, password, phone, specialization, bio, avatar, skills } = req.body;"
);
staffCtrl = staffCtrl.replace(
  "avatar: avatar || '',",
  "avatar: avatar || '',\n      skills: Array.isArray(skills) ? skills : [],"
);
staffCtrl = staffCtrl.replace(
  "const allowedFields = ['name', 'phone', 'specialization', 'bio', 'avatar', 'isActive'];",
  "const allowedFields = ['name', 'phone', 'specialization', 'bio', 'avatar', 'skills', 'isActive'];"
);
fs.writeFileSync(staffCtrlPath, staffCtrl, 'utf8');
console.log('Updated staffController.js to save skills and phone');
