import { useState, useContext, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, Badge, Stars, Button, PageHeader, Input, Modal, ConfirmActionModal, SuccessToast } from "../../components/ui";
import { AuthContext } from "../../context/AuthContext";
import { useProjects } from "../../context/ProjectsContext";
import { courses, dummyUsers, instructorDirectory, portfolios } from "../../data/dummy";

/** Merge directory row with auth user record so public instructor pages show office hours, LinkedIn, courses, etc. */
function mergeInstructorPublicView(instructor) {
  if (!instructor) return null;
  const account = dummyUsers.find(
    (u) => u.role === "instructor" && u.email === instructor.email
  );
  return {
    ...(account || {}),
    ...instructor,
    id: account?.id ?? instructor.id,
    name: instructor.name,
    email: instructor.email,
    role: "instructor",
    coursesTaught: account?.coursesTaught ?? instructor.coursesTaught,
  };
}

function StudentProfile({ user, updateUser, myProjects, isReadOnly, onBackToPortfolios }) {
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    major: user?.major || "",
    linkedIn: user?.linkedIn || "",
    skills: user?.skills || [],
    avatar: user?.avatar || null,
  });
  const [newSkill, setNewSkill] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleOpenEdit = () => {
    if (isReadOnly) return;
    setFieldErrors({});
    setFormData({
      major: user?.major || "",
      linkedIn: user?.linkedIn || "",
      skills: user?.skills || [],
      avatar: user?.avatar || null,
    });
    setNewSkill("");
    setIsEditModalOpen(true);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSkill = () => {
    const trimmedSkill = newSkill.trim();
    if (trimmedSkill && !formData.skills.includes(trimmedSkill)) {
      setFormData((previous) => ({
        ...previous,
        skills: [...previous.skills, trimmedSkill],
      }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((previous) => ({
      ...previous,
      skills: previous.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleSaveProfile = () => {
    const errors = {};
    if (!formData.major.trim()) errors.major = "Major is required to save your profile";
    if (!formData.linkedIn.trim()) errors.linkedIn = "LinkedIn profile is required to save your profile";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setConfirmation({
      action: "save these changes to your portfolio",
      variant: "primary",
      onConfirm: () => {
        updateUser({
          major: formData.major,
          linkedIn: formData.linkedIn,
          skills: formData.skills,
          avatar: formData.avatar,
        });
        setIsEditModalOpen(false);
        setSuccessMessage("Profile updated successfully!");
      },
    });
  };

  return (
    <div>
      <div className="bg-bg-surface border border-border rounded-lg p-8 mb-6 flex items-start gap-6">
        <div className="w-20 h-20 rounded-full bg-accent-gold/20 border-2 border-accent-gold flex items-center justify-center shrink-0 overflow-hidden">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span className="font-display text-2xl text-accent-gold">
              {user?.name?.split(" ").map((name) => name[0]).join("") || "?"}
            </span>
          )}
        </div>
        <div className="flex-1">
          <h1 className="font-display text-3xl text-text-primary mb-1">{user?.name}</h1>
          <p className="text-text-secondary font-sans text-sm mb-3">{user?.email}</p>
          <p className="text-accent-gold font-mono text-xs mb-4">{user?.major || "No major set"}</p>
          <div className="flex gap-2 flex-wrap">
            {user?.skills?.length ? (
              user.skills.map((skill) => (
                <Badge key={skill} variant="blue">{skill}</Badge>
              ))
            ) : (
              <p className="text-text-secondary text-xs">No skills added yet</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isReadOnly && (
            <Button variant="secondary" size="sm" onClick={handleOpenEdit}>
              Edit Profile
            </Button>
          )}
          {isReadOnly && onBackToPortfolios && (
            <Button variant="secondary" size="sm" onClick={onBackToPortfolios}>
              Back to Portfolios
            </Button>
          )}
        </div>
      </div>

      {user?.linkedIn && (
        <div className="mb-6 p-4 bg-bg-surface border border-border rounded-lg flex items-center gap-3">
          <span className="text-xl">🔗</span>
          <div className="flex-1">
            <p className="text-sm font-sans text-text-secondary mb-1">LinkedIn Profile</p>
            <a href={user.linkedIn} target="_blank" rel="noopener noreferrer" className="text-accent-blue hover:underline text-sm break-all">
              {user.linkedIn}
            </a>
          </div>
        </div>
      )}

      <PageHeader
        title="Portfolio"
        subtitle={`${myProjects.length} public project${myProjects.length !== 1 ? "s" : ""}`}
        action={
          <div className="flex flex-wrap gap-2">
            {!isReadOnly && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/projects")}>
                Manage visibility
              </Button>
            )}
            {isReadOnly && onBackToPortfolios && <span />}
          </div>
        }
      />

      {myProjects.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {myProjects.map((project) => (
            <Card key={project.id} hover>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="blue">{project.courseCode}</Badge>
                <Stars rating={project.rating} />
              </div>
              <h3 className="font-display text-base text-text-primary mb-2">{project.title}</h3>
              <p className="text-text-secondary text-sm font-sans mb-3 line-clamp-2">{project.description}</p>
              <div className="flex gap-2 flex-wrap">
                {project.languages.map((language) => <Badge key={language}>{language}</Badge>)}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-text-secondary text-sm">No public projects yet. Create your first project!</p>
        </Card>
      )}

      {/* Internships Section */}
      {user?.completedInternships?.length > 0 && (
        <div className="mt-8">
          <PageHeader title="Completed Internships" />
          <div className="grid grid-cols-1 gap-4">
            {user.completedInternships.map(internship => (
              <Card key={internship.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-display text-base text-text-primary mb-1">{internship.title}</h3>
                    <p className="text-accent-gold font-mono text-sm mb-2">{internship.company}</p>
                    <p className="text-text-secondary text-sm mb-3">{internship.description}</p>
                    <div className="flex items-center gap-4 text-xs text-text-secondary">
                      <span>{internship.startDate} - {internship.endDate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap mt-3">
                  {internship.skills.map(skill => <Badge key={skill} variant="blue">{skill}</Badge>)}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Portfolio">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 py-2">
            <div className="w-16 h-16 rounded-full bg-accent-gold/10 border border-accent-gold/30 flex items-center justify-center overflow-hidden shrink-0">
              {formData.avatar ? (
                <img src={formData.avatar} alt="Avatar preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl text-accent-gold">👤</span>
              )}
            </div>
            <div className="flex-1">
              <label className="text-sm text-text-secondary font-sans mb-1.5 block">Profile Picture</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="text-xs text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-blue/10 file:text-accent-blue hover:file:bg-accent-blue/20 cursor-pointer"
              />
            </div>
          </div>
          <Input
            label="Major"
            type="text"
            placeholder="e.g., Media Engineering & Technology"
            value={formData.major}
            onChange={(e) => setFormData({ ...formData, major: e.target.value })}
            error={fieldErrors.major}
          />
          <Input
            label="LinkedIn Profile URL"
            type="url"
            placeholder="https://linkedin.com/in/yourprofile"
            value={formData.linkedIn}
            onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
            error={fieldErrors.linkedIn}
          />
          <div>
            <label className="text-sm text-text-secondary font-sans mb-1.5 block">Skills</label>
            <div className="flex gap-2 mb-3">
              <Input
                type="text"
                placeholder="Add a skill (e.g., React)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                className="flex-1"
              />
              <Button variant="primary" size="md" type="button" onClick={handleAddSkill}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.skills.map((skill) => (
                <div key={skill} className="flex items-center gap-2 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue px-3 py-1.5 rounded-full text-sm font-mono">
                  <span>{skill}</span>
                  <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-accent-blue/70 transition-colors font-bold">×</button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button variant="primary" className="flex-1" onClick={handleSaveProfile}>Save Changes</Button>
            <Button variant="secondary" className="flex-1" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      <ConfirmActionModal
        isOpen={Boolean(confirmation)}
        action={confirmation?.action}
        variant={confirmation?.variant}
        onClose={() => setConfirmation(null)}
        onConfirm={confirmation?.onConfirm}
      />
      <SuccessToast message={successMessage} onClose={() => setSuccessMessage("")} />
    </div>
  );
}

function InstructorProfile({ user, updateUser, myCourses, isReadOnly }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    bio: user?.bio || "",
    researchInterests: user?.researchInterests || [],
    education: user?.education || [],
    coursesTaught: user?.coursesTaught || [],
    linkedin: user?.linkedin || "",
    officeHours: user?.officeHours || "",
    avatar: user?.avatar || null,
  });
  const [newResearchInterest, setNewResearchInterest] = useState("");
  const [newEducationItem, setNewEducationItem] = useState("");

  const handleOpenEdit = () => {
    if (isReadOnly) return;
    setFormData({
      bio: user?.bio || "",
      researchInterests: user?.researchInterests || [],
      education: user?.education || [],
      coursesTaught: user?.coursesTaught || [],
      linkedin: user?.linkedin || "",
      officeHours: user?.officeHours || "",
      avatar: user?.avatar || null,
    });
    setNewResearchInterest("");
    setNewEducationItem("");
    setIsEditModalOpen(true);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCourse = (courseId) => {
    const isLinked = formData.coursesTaught.includes(courseId);
    const nextCourses = isLinked
      ? formData.coursesTaught.filter((item) => item !== courseId)
      : [...formData.coursesTaught, courseId];

    setFormData((previous) => ({
      ...previous,
      coursesTaught: nextCourses,
    }));
  };

  const addListItem = (field, value, setter) => {
    const trimmedValue = value.trim();
    if (!trimmedValue || formData[field].includes(trimmedValue)) return;

    setFormData((previous) => ({
      ...previous,
      [field]: [...previous[field], trimmedValue],
    }));
    setter("");
  };

  const removeListItem = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: previous[field].filter((item) => item !== value),
    }));
  };

  const handleSaveProfile = () => {
    setConfirmation({
      action: "save these changes to your instructor profile",
      variant: "primary",
      onConfirm: () => {
        updateUser({
          bio: formData.bio,
          researchInterests: formData.researchInterests,
          education: formData.education,
          coursesTaught: formData.coursesTaught.includes(4)
            ? formData.coursesTaught
            : [...formData.coursesTaught, 4],
          linkedin: formData.linkedin,
          officeHours: formData.officeHours,
          avatar: formData.avatar,
        });
        setIsEditModalOpen(false);
        setSuccessMessage("Profile updated successfully!");
      },
    });
  };

  return (
    <div>
      <div className="bg-bg-surface border border-border rounded-lg p-8 mb-6 flex items-start gap-6">
        <div className="w-20 h-20 rounded-full bg-accent-blue/20 border-2 border-accent-blue flex items-center justify-center shrink-0 overflow-hidden">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span className="font-display text-2xl text-accent-blue">
              {user?.name?.split(" ").map((name) => name[0]).join("") || "?"}
            </span>
          )}
        </div>
        <div className="flex-1">
          <h1 className="font-display text-3xl text-text-primary mb-1">{user?.name}</h1>
          <p className="text-text-secondary font-sans text-sm mb-3">{user?.email}</p>
          <p className="text-accent-blue font-mono text-xs mb-4">{user?.officeHours || "No office hours set"}</p>
          <p className="max-w-2xl break-words text-sm leading-relaxed text-text-secondary mb-4">{user?.bio}</p>
          <div className="flex gap-2 flex-wrap">
            {user?.researchInterests?.map((interest) => (
              <Badge key={interest} variant="blue">{interest}</Badge>
            ))}
          </div>
        </div>
        {!isReadOnly && <Button variant="secondary" size="sm" onClick={handleOpenEdit}>Edit Profile</Button>}
      </div>

      {user?.linkedin && (
        <div className="mb-6 p-4 bg-bg-surface border border-border rounded-lg flex items-center gap-3">
          <span className="text-xl">🔗</span>
          <div className="flex-1">
            <p className="text-sm font-sans text-text-secondary mb-1">LinkedIn Profile</p>
            <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="text-accent-blue hover:underline text-sm break-all">
              {user.linkedin}
            </a>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-lg text-text-primary mb-4">Education</h2>
          <div className="flex flex-col gap-2">
            {user?.education?.map((item) => (
              <div key={item} className="text-sm text-text-secondary border border-border rounded-lg px-3 py-2 bg-bg-elevated">{item}</div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-lg text-text-primary mb-4">Courses Taught</h2>
          <div className="flex flex-wrap gap-2">
            {myCourses.map((course) => (
              <Badge key={course.id} variant="gold">{course.name}</Badge>
            ))}
          </div>
          <p className="text-text-secondary text-xs mt-3">Bachelor Project is automatically linked for supervisor/instructor context.</p>
        </Card>
      </div>

      <PageHeader
        title="Instructor Portfolio"
        subtitle={`${myCourses.length} linked course${myCourses.length !== 1 ? "s" : ""}`}
      />

      <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2">
        {myCourses.map((course) => (
          <Card key={course.id} hover>
            <Badge variant="blue" className="mb-3">{course.code}</Badge>
            <h3 className="font-display text-base text-text-primary mb-2">{course.name}</h3>
            <p className="text-text-secondary text-sm">Linked to this instructor profile.</p>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="font-display text-lg text-text-primary mb-4">Research Interests</h2>
        <div className="flex flex-wrap gap-2">
          {user?.researchInterests?.map((item) => (
            <Badge key={item} variant="blue">{item}</Badge>
          ))}
        </div>
      </Card>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Instructor Profile">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 py-2">
            <div className="w-16 h-16 rounded-full bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center overflow-hidden shrink-0">
              {formData.avatar ? (
                <img src={formData.avatar} alt="Avatar preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl text-accent-blue">👤</span>
              )}
            </div>
            <div className="flex-1">
              <label className="text-sm text-text-secondary font-sans mb-1.5 block">Profile Picture</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="text-xs text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-blue/10 file:text-accent-blue hover:file:bg-accent-blue/20 cursor-pointer"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-text-secondary font-sans mb-1.5 block">Bio</label>
            <textarea
              className="w-full min-h-28 bg-bg-elevated border border-border rounded-lg px-4 py-3 text-text-primary text-sm font-sans placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-blue transition-colors"
              placeholder="Short professional bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>

          <Input
            label="LinkedIn Profile URL"
            type="url"
            placeholder="https://linkedin.com/in/yourprofile"
            value={formData.linkedin}
            onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
          />

          <Input
            label="Office Hours"
            type="text"
            placeholder="Mon 12:00-14:00"
            value={formData.officeHours}
            onChange={(e) => setFormData({ ...formData, officeHours: e.target.value })}
          />

          <div>
            <label className="text-sm text-text-secondary font-sans mb-1.5 block">Research Interests</label>
            <div className="flex gap-2 mb-3">
              <Input
                type="text"
                placeholder="Add a research interest"
                value={newResearchInterest}
                onChange={(e) => setNewResearchInterest(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addListItem("researchInterests", newResearchInterest, setNewResearchInterest)}
                className="flex-1"
              />
              <Button variant="primary" size="md" type="button" onClick={() => addListItem("researchInterests", newResearchInterest, setNewResearchInterest)}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.researchInterests.map((item) => (
                <div key={item} className="flex items-center gap-2 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue px-3 py-1.5 rounded-full text-sm font-mono">
                  <span>{item}</span>
                  <button type="button" onClick={() => removeListItem("researchInterests", item)} className="hover:text-accent-blue/70 font-bold">×</button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-text-secondary font-sans mb-1.5 block">Education</label>
            <div className="flex gap-2 mb-3">
              <Input
                type="text"
                placeholder="Add an education entry"
                value={newEducationItem}
                onChange={(e) => setNewEducationItem(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addListItem("education", newEducationItem, setNewEducationItem)}
                className="flex-1"
              />
              <Button variant="primary" size="md" type="button" onClick={() => addListItem("education", newEducationItem, setNewEducationItem)}>Add</Button>
            </div>
            <div className="flex flex-col gap-2">
              {formData.education.map((item) => (
                <div key={item} className="flex items-center justify-between bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary">
                  <span>{item}</span>
                  <button type="button" onClick={() => removeListItem("education", item)} className="text-danger hover:opacity-70 font-bold">Remove</button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-text-secondary font-sans mb-1.5 block">Courses Taught</label>
            <div className="flex flex-wrap gap-2">
              {courses.map((course) => {
                const linked = formData.coursesTaught.includes(course.id) || course.code === "BP";
                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => toggleCourse(course.id)}
                    className={`px-3 py-2 rounded-full text-sm font-mono border transition-colors ${linked ? "bg-accent-gold/10 text-accent-gold border-accent-gold/40" : "bg-bg-elevated text-text-secondary border-border hover:border-accent-blue/40 hover:text-text-primary"}`}
                  >
                    {course.name}
                    {course.code === "BP" ? " (auto-linked)" : ""}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button variant="primary" className="flex-1" onClick={handleSaveProfile}>Save Changes</Button>
            <Button variant="secondary" className="flex-1" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      <ConfirmActionModal
        isOpen={Boolean(confirmation)}
        action={confirmation?.action}
        variant={confirmation?.variant}
        onClose={() => setConfirmation(null)}
        onConfirm={confirmation?.onConfirm}
      />
      <SuccessToast message={successMessage} onClose={() => setSuccessMessage("")} />
    </div>
  );
}

function InstructorDirectoryPreview() {
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);
  return (
    <Card>
      <h2 className="font-display text-lg text-text-primary mb-4">Instructor Directory Preview</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {instructorDirectory.map((instructor) => (
          <div 
            key={instructor.id} 
            className="p-4 rounded-lg border border-border bg-bg-elevated hover:border-accent-gold/40 transition-colors cursor-pointer group"
            onClick={() => {
              if (currentUser?.email === instructor.email) {
                navigate("/profile");
              } else {
                navigate(`/explore/portfolio/instructor-${instructor.id}`);
              }
            }}
          >
            <p className="text-text-primary font-medium mb-1 group-hover:text-accent-gold transition-colors">{instructor.name}</p>
            <p className="text-text-secondary mb-2 text-sm leading-relaxed break-words">{instructor.bio}</p>
            <div className="flex flex-wrap gap-2">
              {instructor.coursesTaught.map((courseId) => {
                const course = courses.find((item) => item.id === courseId);
                return course ? <Badge key={course.id} variant="blue">{course.code}</Badge> : null;
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function EmployerProfile({ user, updateUser, readOnly = false }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    companyName: user?.companyName || "",
    companyBio: user?.companyBio || "",
    address: user?.address || "",
    location: user?.location || "Cairo, Egypt",
    companyEmail: user?.companyEmail || "",
    companyPhone: user?.companyPhone || "",
    verificationStatus: user?.verificationStatus || "pending",
    uploadedDocs: user?.uploadedDocs || [],
    logo: user?.logo || null,
  });
  const [pendingLocation, setPendingLocation] = useState(user?.location || "Cairo, Egypt");
  const [viewingDoc, setViewingDoc] = useState(null);
  const [locationConfirmOpen, setLocationConfirmOpen] = useState(false);

  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(formData.location || pendingLocation)}&output=embed`;

  const handleOpenEdit = () => {
    setFormData({
      companyName: user?.companyName || "",
      companyBio: user?.companyBio || "",
      address: user?.address || "",
      location: user?.location || "Cairo, Egypt",
      companyEmail: user?.companyEmail || "",
      companyPhone: user?.companyPhone || "",
      verificationStatus: user?.verificationStatus || "pending",
      uploadedDocs: user?.uploadedDocs || [],
      logo: user?.logo || null,
    });
    setPendingLocation(user?.location || "Cairo, Egypt");
    setIsEditModalOpen(true);
  };

  const requestOpenProfileEditor = () => {
    setConfirmation({
      action: "open your company profile for editing",
      variant: "gold",
      onConfirm: () => handleOpenEdit(),
    });
  };

  const handleDocUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const nextDocs = [
      ...formData.uploadedDocs,
      ...files.map((file, index) => ({
        id: Date.now() + index,
        name: file.name,
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString().slice(0, 10),
      })),
    ];

    setFormData((previous) => ({
      ...previous,
      uploadedDocs: nextDocs,
    }));
    event.target.value = "";
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    if (formData.uploadedDocs.length === 0) {
      setSuccessMessage("");
      window.dispatchEvent(
        new CustomEvent("portfolio-toast-notification", {
          detail: {
            title: "Tax certificate required",
            body: "Upload at least one verification PDF (for example your tax certificate) before saving employer profile changes.",
            dismissSessionKey: "portfolio-employer-tax-cert-hint",
          },
        })
      );
      return;
    }
    setConfirmation({
      action: "save these changes to your company profile",
      variant: "primary",
      onConfirm: () => {
        updateUser({
          companyName: formData.companyName,
          companyBio: formData.companyBio,
          address: formData.address,
          location: formData.location,
          companyEmail: formData.companyEmail,
          companyPhone: formData.companyPhone,
          verificationStatus: formData.verificationStatus,
          uploadedDocs: formData.uploadedDocs,
          logo: formData.logo,
        });
        setIsEditModalOpen(false);
        setSuccessMessage("Company profile updated successfully!");
      },
    });
  };

  const applyPinnedLocation = () => {
    setFormData((previous) => ({
      ...previous,
      location: pendingLocation,
    }));
    updateUser({
      ...user,
      location: pendingLocation,
    });
    setSuccessMessage("Location updated successfully!");
    setLocationConfirmOpen(false);
  };

  const removeDoc = (docId) => {
    const doc = formData.uploadedDocs.find(d => d.id === docId);
    setConfirmation({
      action: `remove document "${doc?.name}"`,
      variant: "danger",
      onConfirm: () => {
        setFormData((previous) => ({
          ...previous,
          uploadedDocs: previous.uploadedDocs.filter((doc) => doc.id !== docId),
        }));
      },
    });
  };

  return (
    <div>
      <div className="bg-bg-surface border border-border rounded-lg p-8 mb-6 flex items-start gap-6">
        <div className="w-20 h-20 rounded-full bg-accent-gold/20 border-2 border-accent-gold flex items-center justify-center shrink-0 overflow-hidden">
          {user?.logo ? (
            <img src={user.logo} alt={user.companyName} className="w-full h-full object-cover" />
          ) : (
            <span className="font-display text-2xl text-accent-gold">
              {user?.companyName?.split(" ").map((name) => name[0]).join("") || "E"}
            </span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="font-display text-3xl text-text-primary">{user?.name}</h1>
            <Badge variant={user?.verificationStatus === "approved" ? "success" : user?.verificationStatus === "rejected" ? "danger" : "warning"}>
              {user?.verificationStatus || "pending"}
            </Badge>
          </div>
          <p className="text-text-secondary font-sans text-sm mb-3">{user?.companyEmail}</p>
          <p className="text-accent-gold font-mono text-xs mb-4">{user?.address}</p>
          <p className="text-text-secondary text-sm max-w-2xl">{user?.companyBio}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={requestOpenProfileEditor} disabled={readOnly}>
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <Card>
          <h2 className="font-display text-lg text-text-primary mb-4">Company Information</h2>
          <div className="flex flex-col gap-3 text-sm">
            <div>
              <p className="text-text-secondary text-xs uppercase tracking-widest mb-1">Company Name</p>
              <p className="text-text-primary">{user?.companyName}</p>
            </div>
            <div>
              <p className="text-text-secondary text-xs uppercase tracking-widest mb-1">Email</p>
              <p className="text-text-primary">{user?.companyEmail}</p>
            </div>
            <div>
              <p className="text-text-secondary text-xs uppercase tracking-widest mb-1">Phone</p>
              <p className="text-text-primary">{user?.companyPhone}</p>
            </div>
            <div>
              <p className="text-text-secondary text-xs uppercase tracking-widest mb-1">Address</p>
              <p className="text-text-primary">{user?.address}</p>
            </div>
            <div>
              <p className="text-text-secondary text-xs uppercase tracking-widest mb-1">Selected Location</p>
              <p className="text-text-primary">{user?.location}</p>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-lg text-text-primary mb-4">Verification Documents</h2>
          <div className="flex flex-col gap-2">
            {user?.uploadedDocs?.length ? user.uploadedDocs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm group">
                <div 
                  className="cursor-pointer flex-1"
                  onClick={() => setViewingDoc(doc)}
                >
                  <p className="text-text-primary group-hover:text-accent-gold transition-colors">{doc.name}</p>
                  <p className="text-text-secondary text-xs">Uploaded {doc.uploadedAt}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setViewingDoc(doc)}
                    className="text-accent-gold hover:text-accent-gold/80 transition-colors"
                    title="View Document"
                  >
                    👁
                  </button>
                  <Badge variant="gold">PDF</Badge>
                </div>
              </div>
            )) : (
              <p className="text-danger text-sm font-medium">⚠️ Tax certificate required. Please upload one.</p>
            )}
          </div>
        </Card>
      </div>

      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-lg text-text-primary">Google Maps Location</h2>
            <p className="text-text-secondary text-sm">Pick a company location and preview it on the map.</p>
          </div>
          <Badge variant="blue">Demo map picker</Badge>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            "Tahrir Square, Cairo, Egypt",
            "New Cairo, Cairo, Egypt",
            "6th of October City, Giza, Egypt",
          ].map((location) => (
            <Button
              key={location}
              type="button"
              variant={pendingLocation === location ? "gold" : "secondary"}
              onClick={() => setPendingLocation(location)}
              className="justify-center"
            >
              {location.split(",")[0]}
            </Button>
          ))}
        </div>
        <div className="h-72 rounded-lg overflow-hidden border border-border bg-bg-elevated">
          <iframe
            title="Company location map"
            src={mapSrc}
            className="w-full h-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div className="flex gap-3 mt-4">
          <Input
            label="Location preview"
            value={pendingLocation}
            onChange={(e) => setPendingLocation(e.target.value)}
          />
          <div className="flex items-end">
            <Button type="button" variant="primary" onClick={() => setLocationConfirmOpen(true)}>
              Use this location
            </Button>
          </div>
        </div>
      </Card>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Employer Profile">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 py-2">
            <div className="w-16 h-16 rounded-full bg-accent-gold/10 border border-accent-gold/30 flex items-center justify-center overflow-hidden shrink-0">
              {formData.logo ? (
                <img src={formData.logo} alt="Company logo preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl text-accent-gold">🏢</span>
              )}
            </div>
            <div className="flex-1">
              <label className="text-sm text-text-secondary font-sans mb-1.5 block">Company Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="text-xs text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-gold/10 file:text-accent-gold hover:file:bg-accent-gold/20 cursor-pointer"
              />
            </div>
          </div>
          <Input
            label="Company Name"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          />
          <div>
            <label className="text-sm text-text-secondary font-sans mb-1.5 block">Company Bio</label>
            <textarea
              className="w-full min-h-24 bg-bg-elevated border border-border rounded-lg px-4 py-3 text-text-primary text-sm font-sans placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-blue transition-colors"
              value={formData.companyBio}
              onChange={(e) => setFormData({ ...formData, companyBio: e.target.value })}
            />
          </div>
          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <Input
            label="Company Email"
            type="email"
            value={formData.companyEmail}
            onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
          />
          <Input
            label="Company Phone"
            value={formData.companyPhone}
            onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
          />
          <Input
            label="Verification Status"
            value={formData.verificationStatus}
            onChange={(e) => setFormData({ ...formData, verificationStatus: e.target.value })}
          />

          <div>
            <label className="text-sm text-text-secondary font-sans mb-1.5 block">Company Logo</label>
            <Input type="file" accept="image/*" onChange={handleLogoUpload} />
            {formData.logo && <p className="text-xs text-text-secondary mt-2">Selected logo: {formData.logo}</p>}
          </div>

          <div>
            <label className="text-sm text-text-secondary font-sans mb-1.5 block">Upload Verification PDFs</label>
            <Input type="file" accept="application/pdf" multiple onChange={handleDocUpload} />
            <div className="flex flex-col gap-2 mt-3">
              {formData.uploadedDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm">
                  <div 
                    className="cursor-pointer flex-1"
                    onClick={() => setViewingDoc(doc)}
                  >
                    <p className="text-text-primary hover:text-accent-gold transition-colors">{doc.name}</p>
                    <p className="text-text-secondary text-xs">Uploaded {doc.uploadedAt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button variant="primary" className="flex-1" onClick={handleSaveProfile}>Save Changes</Button>
            <Button variant="secondary" className="flex-1" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={Boolean(viewingDoc)} onClose={() => setViewingDoc(null)} title={`Viewing: ${viewingDoc?.name}`}>
        <div className="flex flex-col gap-4">
          <div className="aspect-[3/4] w-full bg-white rounded-lg overflow-hidden border border-border shadow-inner flex items-center justify-center p-4">
            <div className="text-center">
              <div className="w-full max-w-[400px] border-2 border-dashed border-gray-300 rounded p-8 bg-gray-50 flex flex-col items-center gap-4">
                <div className="text-4xl">📄</div>
                <h3 className="font-display text-xl text-gray-800">SARS TAX COMPLIANCE STATUS</h3>
                <div className="w-full flex flex-col gap-2 text-left text-xs font-mono text-gray-600">
                  <div className="flex justify-between border-b border-gray-200 pb-1">
                    <span>Taxpayer Name:</span>
                    <span>TechCompany Egypt</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-1">
                    <span>Tax Reference Number:</span>
                    <span>1234567890</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-1">
                    <span>Date of Issue:</span>
                    <span>2026-03-15</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-1 font-bold text-green-600">
                    <span>Status:</span>
                    <span>COMPLIANT</span>
                  </div>
                </div>
                <div className="mt-4 p-2 bg-red-100 text-red-600 font-bold border-2 border-red-600 rotate-[-15deg] uppercase">
                  Example Certificate
                </div>
              </div>
              <p className="text-sm text-text-secondary mt-4 font-sans italic">
                (Note: External image resources are currently blocked by browser security. This is a local rendering of the certificate structure.)
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setViewingDoc(null)}>Close</Button>
          </div>
        </div>
      </Modal>

      <ConfirmActionModal
        isOpen={Boolean(confirmation)}
        action={confirmation?.action}
        variant={confirmation?.variant}
        onClose={() => setConfirmation(null)}
        onConfirm={confirmation?.onConfirm}
      />
      <ConfirmActionModal
        isOpen={locationConfirmOpen}
        action={`update your pinned map location to "${pendingLocation}"`}
        variant="gold"
        onClose={() => setLocationConfirmOpen(false)}
        onConfirm={applyPinnedLocation}
      />
      <SuccessToast message={successMessage} onClose={() => setSuccessMessage("")} />
    </div>
  );
}

export default function Profile() {
  const { user: authUser, updateUser } = useContext(AuthContext);
  const { portfolioId } = useParams();
  const navigate = useNavigate();
  const { projectList } = useProjects();
  const location = useLocation();

  const isPublicView = Boolean(portfolioId);

  // If we have a portfolioId, find that user. Otherwise use authed user.
  const user = useMemo(() => {
    if (portfolioId) {
      if (String(portfolioId).startsWith("instructor-")) {
        const instructorId = String(portfolioId).replace("instructor-", "");
        const instructor = instructorDirectory.find((i) => String(i.id) === instructorId);
        const merged = mergeInstructorPublicView(instructor);
        if (merged) return merged;
      }

      const portfolio = portfolios.find((p) => String(p.id) === String(portfolioId));
      if (portfolio) {
        const portfolioUser = dummyUsers.find(
          (candidate) =>
            candidate.email === portfolio.studentEmail || candidate.name === portfolio.owner
        );
        return {
          ...(portfolioUser || {}),
          id: portfolioUser?.id || portfolio.id,
          role: "student",
          name: portfolio.studentName || portfolio.owner,
          email: portfolio.studentEmail,
          major: portfolioUser?.major || portfolio.headline,
          skills: portfolioUser?.skills || portfolio.skills || [],
          linkedIn: portfolioUser?.linkedIn || "",
          avatar: portfolioUser?.avatar || null,
        };
      }

      const instructorLegacy = instructorDirectory.find(
        (i) => String(i.id + 100) === String(portfolioId)
      );
      const mergedLegacy = mergeInstructorPublicView(instructorLegacy);
      if (mergedLegacy) return mergedLegacy;
      return authUser;
    }
    return authUser;
  }, [portfolioId, authUser]);

  const role = user?.role;
  const isReadOnly = isPublicView && user?.email !== authUser?.email;

  const myProjects = useMemo(
    () =>
      projectList.filter(
        (project) =>
          project.owner === user?.name &&
          project.visibility === "public" &&
          project.platformActive !== false &&
          project.flagged !== true &&
          project.hiddenFromPublic !== true
      ),
    [projectList, user]
  );
  const myCourses = useMemo(() => courses.filter((course) => user?.coursesTaught?.includes(course.id)), [user]);

  if (role === "employer") {
    return <EmployerProfile user={user} updateUser={updateUser} />;
  }

  if (role === "instructor") {
    return (
      <div>
        <InstructorProfile user={user} updateUser={updateUser} myCourses={myCourses} isReadOnly={isReadOnly} />
        <div className="mt-6">
          <InstructorDirectoryPreview />
        </div>
      </div>
    );
  }

  if (role !== "student") {
    return (
      <div>
        <PageHeader title="Portfolio" subtitle="Profile view not configured for this role yet" />
        <Card>
          <p className="text-text-secondary">This profile area is currently focused on student and instructor flows.</p>
        </Card>
      </div>
    );
  }

  return (
    <StudentProfile
      user={user}
      updateUser={updateUser}
      myProjects={myProjects}
      isReadOnly={isReadOnly}
      onBackToPortfolios={
        isPublicView && location.state?.fromExploreMode === "portfolios"
          ? () => navigate("/explore", { state: { exploreMode: "portfolios", activeNav: "/explore" } })
          : null
      }
    />
  );
}
