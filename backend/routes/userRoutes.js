const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User'); 
const { getProfile, updateProfile } = require('../controllers/userController');


router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser  = new User({ username, password: hashedPassword });

    try {
        await newUser .save();
        res.status(201).send('User  registered');
    } catch (error) {
        res.status(400).send('Error registering user');
    }
});


router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).send('Invalid credentials');
    }
});

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);


module.exports = router;