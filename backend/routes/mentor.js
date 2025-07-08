// Mentor profile update (set status to pending)
router.put('/profile', mentorAuth, async (req, res) => {
  // ...fields...
  const mentor = await Mentor.findByIdAndUpdate(
    req.mentor.id,
    { ...req.body, status: 'pending' },
    { new: true }
  );
  res.json(mentor);
});

// Add opportunity (status: pending)
router.post('/opportunities', mentorAuth, async (req, res) => {
  const opportunity = await Opportunity.create({
    ...req.body,
    mentor: req.mentor.id,
    status: 'pending'
  });
  res.json(opportunity);
});

// Edit opportunity (status: pending)
router.put('/opportunities/:id', mentorAuth, async (req, res) => {
  const opportunity = await Opportunity.findOneAndUpdate(
    { _id: req.params.id, mentor: req.mentor.id },
    { ...req.body, status: 'pending' },
    { new: true }
  );
  res.json(opportunity);
});

// Add/edit resource (same as above, status: pending)
router.post('/resources', mentorAuth, async (req, res) => {
  const resource = await Resource.create({
    ...req.body,
    mentor: req.mentor.id,
    status: 'pending'
  });
  res.json(resource);
});

router.put('/resources/:id', mentorAuth, async (req, res) => {
  const resource = await Resource.findOneAndUpdate(
    { _id: req.params.id, mentor: req.mentor.id },
    { ...req.body, status: 'pending' },
    { new: true }
  );
  res.json(resource);
});