const bcrypt = require('bcryptjs');

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash('p@ss123', salt, (err, hash) => {
        console.log('Generated hash:', hash);
      });
    });