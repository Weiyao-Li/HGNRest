
const moment = require('moment-timezone');
const UserModel = require('../models/userProfile');
const ReasonModel = require('../models/reason');
const emailSender = require("../utilities/emailSender");


const postReason = async (req, res) => {
  try {
    const { userId, requestor, reasonData } = req.body;

    const newDate = moment
      .tz(reasonData.date, 'America/Los_Angeles')
      .startOf('day');
    const currentDate = moment
      .tz('America/Los_Angeles')
      .startOf('day');

    // error case 0
    if (moment.tz(reasonData.date, 'America/Los_Angeles').day() !== 0) {
      return res.status(400).json({
        message:
          'The selected day must be a sunday so the code can work properly',
        errorCode: 0,
      });
    }

    if (newDate.isBefore(currentDate)) {
      return res.status(400).json({
        message: 'You should select a date that is yet to come',
        errorCode: 7,
      });
    }

    if (!reasonData.message) {
      return res.status(400).json({
        message: 'You must provide a reason.',
        errorCode: 6,
      });
    }

     //Commented this condition to make reason scheduler available to all the users.
    // error case 1
    // if (requestor.role !== 'Owner' && requestor.role !== 'Administrator') {
    //   return res.status(403).json({
    //     message:
    //       'You must be an Owner or Administrator to schedule a reason for a Blue Square',
    //     errorCode: 1,
    //   });
    // }

    const foundUser = await UserModel.findById(userId);

    // error case 2
    if (!foundUser) {
      return res.status(404).json({
        message: 'User not found',
        errorCode: 2,
      });
    }

    const foundReason = await ReasonModel.findOne({
      date: moment
        .tz(reasonData.date, 'America/Los_Angeles')
        .startOf('day')
        .toISOString(),
      userId,
    });

    // error case 3
    if (foundReason) {
      return res.status(403).json({
        message: 'The reason must be unique to the date',
        errorCode: 3,
      });
    }

    const savingDate = moment
      .tz(reasonData.date, 'America/Los_Angeles')
      .startOf('day')
      .toISOString();

    const newReason = new ReasonModel({
      reason: reasonData.message,
      date: savingDate,
      userId,
    });

    
    //await newReason.save();
   const savedData = await newReason.save();
    if(savedData)
    {
     
      //Upon clicking the "Save" button in the Blue Square Reason Scheduler, an email will be automatically sent to the user and Jae.
     const subject = `Blue Square Reason for ${foundUser.firstName} ${foundUser.lastName} has been set`;

          const emailBody = `<p> Hi ! </p>

          <p>This email is to let you know that ${foundUser.firstName} ${foundUser.lastName} has set their Blue Square Reason.</p>
          
          <p>Blue Square Reason : ${newReason.reason} </p>
          <p>Scheduled date for the Blue Square Reason: : ${newReason.date}  </p>
          
          <p>Thank you,<br />
          One Community</p>`;
         
          
          // 1 hardcoded email- emailSender('@gmail.com', subject, emailBody, null, null);

          // 2 user email - 
          emailSender(`${foundUser.email}`, subject, emailBody, null, null);

          //3 - user email and hardcoded email ( After PR approval hardcode Jae's email)
          //  emailSender(`${foundUser.email},@gmail.com`, subject, emailBody, null, null);
     }
  
    return res.sendStatus(200);

  } catch (error) {
    console.log(error);
    return res.status(400).json({
      errMessage: 'Something went wrong',
    });
  }
};

const getAllReasons = async (req, res) => {
  try {
    const { requestor } = req.body;
    const { userId } = req.params;

    // error case 1
    // if (requestor.role !== 'Owner' && requestor.role !== 'Administrator') {
    //   return res.status(403).json({
    //     message:
    //       'You must be an Owner or Administrator to get a reason for a Blue Square',
    //   });
    // }

    const foundUser = await UserModel.findById(userId);

    // error case 2
    if (!foundUser) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const reasons = await ReasonModel.find({
      userId,
    });

    return res.status(200).json({
      reasons,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      errMessage: 'Something went wrong while fetching the user',
    });
  }
};

const getSingleReason = async (req, res) => {
  try {
    const { requestor } = req.body;
    const { userId } = req.params;
    const { queryDate } = req.query;

    // error case 1
    // if (requestor.role !== 'Administrator' && requestor.role !== 'Owner') {
    //   return res.status(403).json({
    //     message:
    //       "You must be an Administrator or Owner to be able to get a single reason by the user's ID",
    //     errorCode: 1,
    //   });
    // }
    const foundUser = await UserModel.findById(userId);

    // error case 2
    if (!foundUser) {
      return res.status(404).json({
        message: 'User not found',
        errorCode: 2,
      });
    }

    const foundReason = await ReasonModel.findOne({
      date: moment
        .tz(queryDate, 'America/Los_Angeles')
        .startOf('day')
        .toISOString(),
      userId,
    });

    if (!foundReason) {
      return res.status(200).json({
        reason: '',
        date: '',
        userId: '',
        isSet: false,
      });
    }

    return res.status(200).json(foundReason);
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: 'Something went wrong while fetching single reason',
    });
  }
};

const patchReason = async (req, res) => {
  try {
    const { requestor, reasonData } = req.body;
    const { userId } = req.params;

    // error case 1
    // if (requestor.role !== 'Owner' && requestor.role !== 'Administrator') {
    //   return res.status(403).json({
    //     message:
    //       'You must be an Owner or Administrator to schedule a reason for a Blue Square',
    //     errorCode: 1,
    //   });
    // }

    if (!reasonData.message) {
      return res.status(400).json({
        message: 'You must provide a reason.',
        errorCode: 6,
      });
    }

    const foundUser = await UserModel.findById(userId);

    // error case 2
    if (!foundUser) {
      return res.status(404).json({
        message: 'User not found',
        errorCode: 2,
      });
    }

    const foundReason = await ReasonModel.findOne({
      date: moment
        .tz(reasonData.date, 'America/Los_Angeles')
        .startOf('day')
        .toISOString(),
      userId,
    });
    // error case 4
    if (!foundReason) {
      return res.status(404).json({
        message: 'Reason not found',
        errorCode: 4,
      });
    }

    foundReason.reason = reasonData.message;
   
    const savedData = await foundReason.save();
    if(savedData)
    {
     
      //Upon clicking the "Save" button in the Blue Square Reason Scheduler, an email will be automatically sent to the user and Jae.
     const subject = `Blue Square Reason for ${foundUser.firstName} ${foundUser.lastName} has been updated`;

          const emailBody = `<p> Hi ! </p>

          <p>This email is to let you know that ${foundUser.firstName} ${foundUser.lastName} has updated their Blue Square Reason.</p>
          
          <p>Updated Blue Square Reason : ${foundReason.reason} </p>
          <p>Scheduled date for the Blue Square Reason: : ${foundReason.date}  </p>
          
          <p>Thank you,<br />
          One Community</p>`;
          
          
          // 1 hardcoded email- emailSender('@gmail.com', subject, emailBody, null, null);

          // 2 user email - 
          emailSender(`${foundUser.email}`, subject, emailBody, null, null);

          //3 - user email and hardcoded email ( After PR approval hardcode Jae's email)
          //  emailSender(`${foundUser.email},@gmail.com`, subject, emailBody, null, null);
         
          
     }

    return res.status(200).json({
      message: 'Reason Updated!',
    });
  } catch (error) {
    return res.status(400).json({
      message: 'something went wrong while patching the reason',
    });
  }
};

const deleteReason = async (req, res) => {
  try {
    const { reasonData, requestor } = req.body;
    const { userId } = req.params;

    //error case 1
    if (requestor.role !== 'Owner' && requestor.role !== 'Administrator') {
      return res.status(403).json({
        message:
          'You must be an Owner or Administrator to schedule a reason for a Blue Square',
        errorCode: 1,
      });
    }

    const foundUser = await UserModel.findById(userId);

    // error case 2
    if (!foundUser) {
      return res.status(404).json({
        message: 'User not found',
        errorCode: 2,
      });
    }

    const foundReason = await ReasonModel.findOne({
      date: moment
        .tz(reasonData.date, 'America/Los_Angeles')
        .startOf('day')
        .toISOString(),
    });

    if (!foundReason) {
      return res.status(404).json({
        message: 'Reason not found',
        errorCode: 4,
      });
    }

    foundReason.remove((err) => {
      if (err) {
        return res.status(500).json({
          message: 'Error while deleting document',
          errorCode: 5,
        });
      }

      return res.status(200).json({
        message: 'Document deleted',
      });
    });
  } catch (error) {}
};

module.exports = {
  postReason,
  getAllReasons,
  getSingleReason,
  patchReason,
  deleteReason,
};
