require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const path = require('path');

const Student = require('./models/Student');
const LostItem = require('./models/LostItem');
const FoundItem = require('./models/FoundItem');
const Claim = require('./models/Claim');
const {
  getValidationMessage,
  isValidObjectId,
  requiredText,
  validDateInput,
  validPhoneNumber
} = require('./lib/validation');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

function renderError(res, status, message) {
  return res.status(status).render('error', { title: 'Error', message });
}

function dateValue(value) {
  return value ? new Date(value) : null;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

app.get('/', (req, res) => {
  res.render('home', { title: 'Campus Lost & Found' });
});

app.get('/students/new', (req, res) => {
  res.render('students/new', { title: 'Create Student Profile', error: null, form: {} });
});

app.post('/students', async (req, res) => {
  const form = {
    fullName: typeof req.body.fullName === 'string' ? req.body.fullName.trim() : '',
    email: typeof req.body.email === 'string' ? req.body.email.trim() : '',
    department: typeof req.body.department === 'string' ? req.body.department.trim() : '',
    contactNumber: typeof req.body.contactNumber === 'string' ? req.body.contactNumber.trim() : ''
  };

  try {
    if (!validPhoneNumber(form.contactNumber)) {
      throw Object.assign(new Error('Contact number must contain exactly 10 digits.'), { status: 400 });
    }
    const student = await Student.create(form);
    res.redirect(`/students/${student._id}`);
  } catch (error) {
    res.status(error.code === 11000 || error.name === 'ValidationError' ? 400 : 500)
      .render('students/new', {
        title: 'Create Student Profile',
        error: getValidationMessage(error),
        form
      });
  }
});

app.get('/students/:id', async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return renderError(res, 400, 'The student ID is invalid.');
  }

  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return renderError(res, 404, 'Student profile not found.');
    }
    return res.render('students/show', { title: student.fullName, student });
  } catch (error) {
    return renderError(res, 500, getValidationMessage(error));
  }
});

app.get('/lost-items/new', async (req, res) => {
  const students = await Student.find().sort({ fullName: 1 });
  res.render('lost-items/new', { title: 'Report Lost Item', error: null, form: {}, students });
});

app.post('/lost-items', async (req, res) => {
  const form = { ...req.body };
  try {
    if (!isValidObjectId(form.reportedBy)) {
      throw Object.assign(new Error('Reporting student ID is invalid.'), { status: 400 });
    }
    const student = await Student.findById(form.reportedBy);
    if (!student) {
      throw Object.assign(new Error('The reporting student does not exist.'), { status: 400 });
    }
    if (!requiredText(form.itemName) || !requiredText(form.category) ||
        !requiredText(form.description) || !requiredText(form.lastSeenLocation) ||
        !validDateInput(form.dateLost)) {
      throw Object.assign(new Error('Enter valid lost-item details and a date that is not in the future.'), { status: 400 });
    }
    const item = await LostItem.create({ ...form, dateLost: dateValue(form.dateLost) });
    res.redirect(`/lost-items/${item._id}`);
  } catch (error) {
    const students = await Student.find().sort({ fullName: 1 });
    res.status(error.status || 500).render('lost-items/new', {
      title: 'Report Lost Item',
      error: error.status ? error.message : getValidationMessage(error),
      form,
      students
    });
  }
});

app.get('/lost-items', async (req, res) => {
  try {
    const filter = {};
    if (requiredText(req.query.search)) {
      const search = escapeRegex(req.query.search.trim());
      filter.$or = [
        { itemName: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') },
        { lastSeenLocation: new RegExp(search, 'i') }
      ];
    }
    const items = await LostItem.find(filter).populate('reportedBy').sort({ dateLost: -1 });
    res.render('lost-items/index', {
      title: 'Lost Items',
      items,
      search: req.query.search || ''
    });
  } catch (error) {
    renderError(res, 500, getValidationMessage(error));
  }
});

app.get('/lost-items/:id', async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return renderError(res, 400, 'The lost-item ID is invalid.');
  }
  try {
    const item = await LostItem.findById(req.params.id).populate('reportedBy');
    if (!item) {
      return renderError(res, 404, 'Lost-item report not found.');
    }
    return res.render('lost-items/show', { title: item.itemName, item });
  } catch (error) {
    return renderError(res, 500, getValidationMessage(error));
  }
});

app.get('/found-items/new', async (req, res) => {
  const students = await Student.find().sort({ fullName: 1 });
  res.render('found-items/new', { title: 'Report Found Item', error: null, form: {}, students });
});

app.post('/found-items', async (req, res) => {
  const form = { ...req.body };
  try {
    if (!isValidObjectId(form.reportedBy)) {
      throw Object.assign(new Error('Reporting student ID is invalid.'), { status: 400 });
    }
    const student = await Student.findById(form.reportedBy);
    if (!student) {
      throw Object.assign(new Error('The reporting student does not exist.'), { status: 400 });
    }
    if (!requiredText(form.itemName) || !requiredText(form.category) ||
        !requiredText(form.description) || !requiredText(form.foundLocation) ||
        !validDateInput(form.dateFound)) {
      throw Object.assign(new Error('Enter valid found-item details and a date that is not in the future.'), { status: 400 });
    }
    const item = await FoundItem.create({ ...form, dateFound: dateValue(form.dateFound) });
    res.redirect(`/found-items/${item._id}`);
  } catch (error) {
    const students = await Student.find().sort({ fullName: 1 });
    res.status(error.status || 500).render('found-items/new', {
      title: 'Report Found Item',
      error: error.status ? error.message : getValidationMessage(error),
      form,
      students
    });
  }
});

app.get('/found-items', async (req, res) => {
  try {
    const items = await FoundItem.find().populate('reportedBy').sort({ dateFound: -1 });
    res.render('found-items/index', { title: 'Found Items', items });
  } catch (error) {
    renderError(res, 500, getValidationMessage(error));
  }
});

app.get('/found-items/:id', async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return renderError(res, 400, 'The found-item ID is invalid.');
  }
  try {
    const item = await FoundItem.findById(req.params.id).populate('reportedBy');
    if (!item) {
      return renderError(res, 404, 'Found-item report not found.');
    }
    const claims = await Claim.find({ foundItemId: item._id })
      .populate('claimedBy')
      .sort({ createdAt: -1 });
    const students = await Student.find().sort({ fullName: 1 });
    return res.render('found-items/show', {
      title: item.itemName,
      item,
      claims,
      students,
      error: null,
      success: req.query.success || null
    });
  } catch (error) {
    return renderError(res, 500, getValidationMessage(error));
  }
});

app.post('/found-items/:id/claims', async (req, res) => {
  const { claimedBy, reason } = req.body;
  try {
    if (!isValidObjectId(req.params.id)) {
      return renderError(res, 400, 'The found-item ID is invalid.');
    }
    if (!isValidObjectId(claimedBy)) {
      return renderError(res, 400, 'The claiming student ID is invalid.');
    }
    if (!requiredText(reason) || reason.trim().length < 10 || reason.trim().length > 1000) {
      return renderError(res, 400, 'Claim reason must contain between 10 and 1000 characters.');
    }

    const [item, student, existingClaim] = await Promise.all([
      FoundItem.findById(req.params.id),
      Student.findById(claimedBy),
      Claim.findOne({ foundItemId: req.params.id, claimedBy })
    ]);
    if (!item) {
      return renderError(res, 404, 'Found-item report not found.');
    }
    if (!student) {
      return renderError(res, 404, 'Claiming student not found.');
    }
    if (item.status === 'Returned') {
      return renderError(res, 409, 'This item has already been returned and cannot be claimed.');
    }
    if (existingClaim) {
      return renderError(res, 409, 'This student has already submitted a claim for this item.');
    }

    await Claim.create({ foundItemId: item._id, claimedBy: student._id, reason: reason.trim() });
    return res.redirect(`/found-items/${item._id}?success=Claim submitted and is pending review.`);
  } catch (error) {
    if (error.code === 11000) {
      return renderError(res, 409, 'This student has already submitted a claim for this item.');
    }
    return renderError(res, 500, getValidationMessage(error));
  }
});

app.patch('/claims/:id/status', async (req, res) => {
  const { status, reviewerId } = req.body;
  try {
    if (!isValidObjectId(req.params.id) || !isValidObjectId(reviewerId)) {
      return renderError(res, 400, 'The claim or reviewer ID is invalid.');
    }
    if (!['Approved', 'Rejected'].includes(status)) {
      return renderError(res, 400, 'Claim status must be Approved or Rejected.');
    }

    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return renderError(res, 404, 'Claim not found.');
    }
    const item = await FoundItem.findById(claim.foundItemId);
    if (!item) {
      return renderError(res, 404, 'The found item linked to this claim was not found.');
    }
    if (String(item.reportedBy) !== String(reviewerId)) {
      return renderError(res, 403, 'Only the student who reported this item can review its claims.');
    }
    if (claim.status !== 'Pending') {
      return renderError(res, 409, 'Only pending claims can be reviewed.');
    }
    if (status === 'Approved' && item.status === 'Returned') {
      return renderError(res, 409, 'This item has already been returned.');
    }

    if (status === 'Approved') {
      const returnedItem = await FoundItem.findOneAndUpdate(
        { _id: item._id, status: 'Available' },
        { $set: { status: 'Returned' } },
        { new: true }
      );
      if (!returnedItem) {
        return renderError(res, 409, 'This item has already been returned.');
      }
      const approvedClaim = await Claim.findOneAndUpdate(
        { _id: claim._id, status: 'Pending' },
        { $set: { status: 'Approved' } },
        { new: true }
      );
      if (!approvedClaim) {
        await FoundItem.updateOne({ _id: item._id }, { $set: { status: 'Available' } });
        return renderError(res, 409, 'This claim was already reviewed.');
      }
      await Claim.updateMany(
        { foundItemId: item._id, status: 'Pending', _id: { $ne: claim._id } },
        { $set: { status: 'Rejected' } }
      );
    } else {
      await Claim.findOneAndUpdate(
        { _id: claim._id, status: 'Pending' },
        { $set: { status: 'Rejected' } }
      );
    }

    return res.redirect(`/found-items/${item._id}?success=Claim ${status.toLowerCase()} successfully.`);
  } catch (error) {
    return renderError(res, 500, getValidationMessage(error));
  }
});

app.use((req, res) => renderError(res, 404, 'The page you requested was not found.'));

async function start() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured. Copy .env.example to .env and set it.');
  }
  await mongoose.connect(process.env.MONGODB_URI);
  app.listen(port, () => {
    console.log(`Campus Lost & Found running on http://localhost:${port}`);
  });
}

if (require.main === module) {
  start().catch((error) => {
    console.error(`Unable to start application: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = app;
