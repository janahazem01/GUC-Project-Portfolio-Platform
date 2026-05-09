import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Badge, Button, Input, Modal, PageHeader, SuccessToast, ConfirmActionModal } from "../../components/ui";
import { AuthContext } from "../../context/AuthContext";
import { internships, portfolios, pushInternshipApplicationDecisionNotification } from "../../data/dummy";
import { useFavorites } from "../../hooks/useFavorites";

const internshipsStorageKey = "gucEmployerInternships";
const selectClass = "w-full bg-bg-elevated border border-border rounded-lg px-4 py-2.5 text-text-primary text-sm font-sans focus:outline-none focus:border-accent-blue transition-colors";
const textAreaClass = "w-full min-h-24 bg-bg-elevated border border-border rounded-lg px-4 py-3 text-text-primary text-sm font-sans placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-blue transition-colors resize-none";
const emptyInternshipForm = {
  title: "",
  details: "",
  skills: "",
  duration: "",
  deadline: "",
  languages: "",
  status: "hiring",
};

const applicantStatusLabels = {
  nominated: "Nominated",
  accepted: "Accepted",
  rejected: "Rejected",
};

function splitList(value) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatStatus(status) {
  return status === "hiring" ? "Currently hiring" : "Position filled";
}

function getStatusVariant(status) {
  if (status === "hiring") return "success";
  if (status === "filled") return "warning";
  if (status === "accepted") return "success";
  if (status === "rejected") return "danger";
  return "blue";
}

function isDeadlinePassed(deadline) {
  if (!deadline) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadlineDate = new Date(`${deadline}T00:00:00`);
  return deadlineDate < today;
}

function hydrateInternshipData(savedInternships) {
  if (!Array.isArray(savedInternships)) return internships;

  return savedInternships.map((internship) => {
    const template = internships.find((item) => item.id === internship.id);
    const postedAt = internship.postedAt || template?.postedAt || internship.deadline || new Date().toISOString().split("T")[0];
    return {
      ...internship,
      postedAt,
    };
  });
}

function getInitialInternships() {
  try {
    const savedInternships = localStorage.getItem(internshipsStorageKey);
    return savedInternships ? hydrateInternshipData(JSON.parse(savedInternships)) : internships;
  } catch {
    return internships;
  }
}

function StatCard({ label, value }) {
  return (
    <Card>
      <p className="text-text-secondary text-xs font-sans uppercase tracking-widest mb-2">{label}</p>
      <p className="font-mono text-3xl text-text-primary">{value}</p>
    </Card>
  );
}

function InternshipFormModal({ formMode, formData, errors, onChange, onClose, onSubmit }) {
  return (
    <Modal
      isOpen={Boolean(formMode)}
      onClose={onClose}
      title={formMode === "add" ? "Add Internship" : "Edit Internship"}
    >
      <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
        <div>
          <Input
            label="Internship Title"
            value={formData.title}
            onChange={(event) => onChange("title", event.target.value)}
            placeholder="Frontend Engineer Intern"
          />
          {errors.title && <p className="text-danger text-xs font-sans mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="text-sm text-text-secondary font-sans mb-1.5 block">
            Internship details (responsibilities)
          </label>
          <textarea
            value={formData.details}
            onChange={(event) => onChange("details", event.target.value)}
            placeholder="Describe the main responsibilities for this internship"
            className={textAreaClass}
          />
          {errors.details && <p className="text-danger text-xs font-sans mt-1">{errors.details}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Input
              label="Duration"
              value={formData.duration}
              onChange={(event) => onChange("duration", event.target.value)}
              placeholder="3 months"
            />
            {errors.duration && <p className="text-danger text-xs font-sans mt-1">{errors.duration}</p>}
          </div>
          <div>
            <Input
              label="Application Deadline"
              type="date"
              value={formData.deadline}
              onChange={(event) => onChange("deadline", event.target.value)}
            />
            {errors.deadline && <p className="text-danger text-xs font-sans mt-1">{errors.deadline}</p>}
          </div>
        </div>

        <div>
          <Input
            label="Skills"
            value={formData.skills}
            onChange={(event) => onChange("skills", event.target.value)}
            placeholder="React, UX, Testing"
          />
          {errors.skills && <p className="text-danger text-xs font-sans mt-1">{errors.skills}</p>}
        </div>

        <div>
          <Input
            label="Programming Languages to be Used"
            value={formData.languages}
            onChange={(event) => onChange("languages", event.target.value)}
            placeholder="JavaScript, Python, SQL"
          />
          {errors.languages && <p className="text-danger text-xs font-sans mt-1">{errors.languages}</p>}
        </div>

        <div>
          <label className="text-sm text-text-secondary font-sans mb-1.5 block">Hiring Status</label>
          <select
            value={formData.status}
            onChange={(event) => onChange("status", event.target.value)}
            className={selectClass}
          >
            <option value="hiring">Currently hiring</option>
            <option value="filled">Position filled</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="gold">
            {formMode === "add" ? "Add Internship" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function ApplicationFormModal({ isOpen, onClose, internship, onSubmit }) {
  const [coverLetter, setCoverLetter] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!coverLetter.trim()) {
      nextErrors.coverLetter = "Cover letter cannot be empty";
    }

    if (coverLetter.trim().length < 10) {
      nextErrors.coverLetter = "Cover letter must be at least 10 characters";
    }

    setErrors(nextErrors);
    
    if (Object.keys(nextErrors).length === 0) {
      onSubmit(coverLetter);
      setCoverLetter("");
      setErrors({});
    }
  };

  const handleClose = () => {
    setCoverLetter("");
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Apply for Internship">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <div>
          <p className="text-text-secondary text-xs uppercase tracking-widest font-sans mb-2">Position</p>
          <p className="text-text-primary text-sm font-sans mb-1">{internship?.title}</p>
          <p className="text-accent-blue text-sm font-sans">{internship?.company}</p>
        </div>

        <div>
          <label className="text-sm text-text-secondary font-sans mb-1.5 block">
            Cover Letter *
          </label>
          <textarea
            value={coverLetter}
            onChange={(event) => {
              setCoverLetter(event.target.value);
              if (errors.coverLetter) setErrors({});
            }}
            placeholder="Tell us why you think you're a great fit for this internship..."
            className={textAreaClass}
          />
          {errors.coverLetter && <p className="text-danger text-xs font-sans mt-1">{errors.coverLetter}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="gold">Submit Application</Button>
        </div>
      </form>
    </Modal>
  );
}

function StudentInternshipBrowser({ internshipList, setInternshipList, user }) {
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [durationFilter, setDurationFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewedInternship, setViewedInternship] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [filterAppliedMessage, setFilterAppliedMessage] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Get unique companies and durations for filters
  const uniqueCompanies = useMemo(
    () => [...new Set(internshipList.filter(i => !i.archived).map(i => i.company))].sort(),
    [internshipList]
  );

  const uniqueDurations = useMemo(
    () => [...new Set(internshipList.filter(i => !i.archived).map(i => i.duration))].sort(),
    [internshipList]
  );

  const hasActiveFilters = companyFilter !== "" || durationFilter !== "";

  const visibleInternships = useMemo(() => {
    let filtered = internshipList.filter((internship) => {
      const searchableText = [
        internship.title,
        internship.company,
        internship.details,
        ...(internship.skills || []),
        ...(internship.languages || []),
      ].join(" ").toLowerCase();

      const matchesSearch = search.trim() === "" || searchableText.includes(search.toLowerCase());
      const matchesCompany = companyFilter === "" || internship.company === companyFilter;
      const matchesDuration = durationFilter === "" || internship.duration === durationFilter;

      return !internship.archived && matchesSearch && matchesCompany && matchesDuration;
    });

    // Create new sorted array to avoid mutation issues
    let sorted = [...filtered];
    
    if (sortBy === "newest") {
      sorted.sort((a, b) => new Date(b.postedAt || "1900-01-01") - new Date(a.postedAt || "1900-01-01"));
    } else if (sortBy === "oldest") {
      sorted.sort((a, b) => new Date(a.postedAt || "1900-01-01") - new Date(b.postedAt || "1900-01-01"));
    } else if (sortBy === "deadline") {
      sorted.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    }

    return sorted;
  }, [internshipList, search, companyFilter, durationFilter, sortBy]);

  const handleViewInternship = (internship) => {
    setViewedInternship(internship);
  };

  const handleFilterChange = (type, value) => {
    if (type === "company") {
      setCompanyFilter(value);
    } else if (type === "duration") {
      setDurationFilter(value);
    }
  };

  const clearFilters = () => {
    setCompanyFilter("");
    setDurationFilter("");
    setShowFilterMenu(false);
  };

  const handleApplyFilters = () => {
    setShowFilterMenu(false);
    setFilterAppliedMessage(true);
  };

  const requestConfirmation = (action, onConfirm) => {
    setConfirmation({ action, onConfirm });
  };

  const handleApplyClick = (internship) => {
    setSelectedInternship(internship);
    setShowApplicationForm(true);
  };

  const handleApplicationSubmit = (coverLetter) => {
    setShowApplicationForm(false);
    requestConfirmation("submit an application for this internship", () => {
      const newApplication = {
        id: Date.now(),
        studentName: user?.name || "Unknown Student",
        studentEmail: user?.email || "",
        portfolioId: user?.id || 0,
        portfolioTitle: "Student Portfolio",
        skills: user?.skills || [],
        languages: [],
        contributionScore: 0,
        projectCount: 0,
        matchScore: 0,
        appliedAt: new Date().toISOString().split("T")[0],
        status: "nominated",
        coverLetter: coverLetter,
      };

      const updatedInternships = internshipList.map((internship) =>
        internship.id === selectedInternship.id
          ? {
              ...internship,
              applications: [...(internship.applications || []), newApplication],
            }
          : internship
      );

      setInternshipList(updatedInternships);
      setSuccessMessage("Application submitted successfully!");
      setSelectedInternship(null);
    });
  };

  return (
    <div>
      <PageHeader
        title="Internships"
        subtitle="Find opportunities that match your skills"
      />

      {/* Enhanced Search Bar and Filters Layout */}
      <div className="flex gap-4 mb-8 items-end">
        {/* Full Width Search Bar */}
        <div className="flex-1">
          <Input
            label="Search internships"
            placeholder="Search by job title, company name, skills..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {/* Combined Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className={`px-4 py-2.5 rounded-lg font-sans text-sm font-medium transition-all border ${
              hasActiveFilters
                ? "bg-accent-gold/10 border-accent-gold/50 text-accent-gold hover:border-accent-gold/70"
                : "bg-bg-elevated border-border text-text-secondary hover:border-accent-blue"
            }`}
          >
            ⊙ Filters {hasActiveFilters && <span className="ml-1 font-bold">●</span>}
          </button>

          {showFilterMenu && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowFilterMenu(false)}
              />

              {/* Filter Menu */}
              <div className="absolute right-0 mt-2 w-56 bg-bg-surface border border-border rounded-lg shadow-lg z-20 overflow-hidden">
                <div className="p-4 border-b border-border">
                  <p className="text-text-primary text-sm font-sans font-bold mb-4">Filter Options</p>

                  {/* Company Filter */}
                  <div className="mb-4">
                    <label className="text-xs text-text-secondary font-sans uppercase tracking-wider mb-2 block">
                      By Company
                    </label>
                    <select
                      value={companyFilter}
                      onChange={(event) => handleFilterChange("company", event.target.value)}
                      className={selectClass}
                    >
                      <option value="">All Companies</option>
                      {uniqueCompanies.map((company) => (
                        <option key={company} value={company}>
                          {company}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Duration Filter */}
                  <div className="mb-4">
                    <label className="text-xs text-text-secondary font-sans uppercase tracking-wider mb-2 block">
                      By Duration
                    </label>
                    <select
                      value={durationFilter}
                      onChange={(event) => handleFilterChange("duration", event.target.value)}
                      className={selectClass}
                    >
                      <option value="">All Durations</option>
                      {uniqueDurations.map((duration) => (
                        <option key={duration} value={duration}>
                          {duration}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="p-4 flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </Button>
                  <Button
                    variant="gold"
                    size="sm"
                    className="flex-1"
                    onClick={handleApplyFilters}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sort Dropdown */}
        <div>
          <label className="text-xs text-text-secondary font-sans uppercase tracking-wider mb-1.5 block">Sort</label>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className={selectClass}
          >
            <option value="newest">Newest Postings</option>
            <option value="oldest">Oldest Postings</option>
            <option value="deadline">Earliest Deadline</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-text-secondary text-sm font-sans">
          Showing {visibleInternships.length} internship{visibleInternships.length !== 1 ? "s" : ""}
          {hasActiveFilters && " (filtered)"}
        </p>
      </div>

      {/* Internships Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {visibleInternships.length > 0 ? (
          visibleInternships.map((internship) => {
            return (
              <Card
                key={String(internship.id)}
                hover
                className="cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between mb-3 gap-4">
                  <div className="flex-1">
                    <h3 className="font-display text-base text-text-primary mb-1">{internship.title}</h3>
                    <p className="text-accent-blue text-sm font-sans">{internship.company}</p>
                  </div>
                  <Badge variant={internship.status === "hiring" ? "success" : "default"}>
                    {internship.status === "hiring" ? "Hiring" : "Filled"}
                  </Badge>
                </div>

                <p className="text-text-secondary text-sm font-sans mb-4 line-clamp-2">{internship.details}</p>

                <div className="flex gap-2 flex-wrap mb-4">
                  {internship.skills.slice(0, 3).map((skill) => (
                    <Badge key={skill}>{skill}</Badge>
                  ))}
                  {internship.skills.length > 3 && (
                    <Badge variant="default">+{internship.skills.length - 3}</Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-border text-xs text-text-secondary">
                  <div className="font-mono">{internship.duration}</div>
                  <div className="font-mono">Posted {internship.postedAt || "N/A"}</div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleViewInternship(internship)}
                  >
                    View
                  </Button>
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() => handleApplyClick(internship)}
                    disabled={internship.status !== "hiring"}
                    className={internship.status !== "hiring" ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    {internship.status === "hiring" ? "Apply" : "Filled"}
                  </Button>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="lg:col-span-2">
            <p className="text-text-secondary text-sm font-sans text-center py-8">
              No internships found matching your filters. Try adjusting your search criteria.
            </p>
          </Card>
        )}
      </div>

      {/* View Internship Modal */}
      <Modal
        isOpen={Boolean(viewedInternship)}
        onClose={() => setViewedInternship(null)}
        title={viewedInternship?.title || "Internship details"}
      >
        {viewedInternship && (
          <div className="space-y-6">
            <div>
              <p className="text-accent-blue text-sm font-sans mb-2">{viewedInternship.company}</p>
              <p className="text-text-secondary text-sm font-sans mb-4">{viewedInternship.details}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-text-secondary text-xs uppercase tracking-widest font-sans mb-1">Duration</p>
                <p className="text-text-primary text-sm font-sans">{viewedInternship.duration}</p>
              </div>
              <div>
                <p className="text-text-secondary text-xs uppercase tracking-widest font-sans mb-1">Deadline</p>
                <p className="text-text-primary text-sm font-mono">{viewedInternship.deadline}</p>
              </div>
              <div>
                <p className="text-text-secondary text-xs uppercase tracking-widest font-sans mb-1">Posted</p>
                <p className="text-text-primary text-sm font-mono">{viewedInternship.postedAt}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-text-secondary text-xs uppercase tracking-widest font-sans mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {viewedInternship.skills.map((skill) => (
                    <Badge key={skill}>{skill}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-text-secondary text-xs uppercase tracking-widest font-sans mb-2">Languages</p>
                <div className="flex flex-wrap gap-2">
                  {viewedInternship.languages.map((language) => (
                    <Badge key={language} variant="blue">{language}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setViewedInternship(null)}>
                Close
              </Button>
              <Button variant="gold" onClick={() => {
                handleApplyClick(viewedInternship);
                setViewedInternship(null);
              }}
              >
                Apply
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modals */}
      <ApplicationFormModal
        isOpen={showApplicationForm}
        onClose={() => setShowApplicationForm(false)}
        internship={selectedInternship}
        onSubmit={handleApplicationSubmit}
      />

      {/* Filter Applied Message */}
      {filterAppliedMessage && (
        <SuccessToast message="Filters are applied successfully" onClose={() => setFilterAppliedMessage(false)} />
      )}

      {/* Confirmation Modal */}
      <ConfirmActionModal
        isOpen={Boolean(confirmation)}
        onClose={() => setConfirmation(null)}
        action={confirmation?.action}
        onConfirm={() => {
          confirmation?.onConfirm();
          setConfirmation(null);
        }}
        variant="primary"
      />

      {/* Success Message Modal */}
      {successMessage && (
        <SuccessToast message={successMessage} onClose={() => setSuccessMessage("")} />
      )}
    </div>
  );
}

function EmployerInternships({ user, internshipList, setInternshipList }) {
  const navigate = useNavigate();
  const { internshipId } = useParams();
  const companyName = user?.companyName || user?.name || "";
  const [formMode, setFormMode] = useState(null);
  const [editingInternship, setEditingInternship] = useState(null);
  const [formData, setFormData] = useState(emptyInternshipForm);
  const [errors, setErrors] = useState({});
  const [confirmation, setConfirmation] = useState(null);
  const [selectedListInternshipId, setSelectedListInternshipId] = useState(null);
  const [applicationSort, setApplicationSort] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const {
    favoritePortfolioIds,
    isFavoritePortfolio,
    savePortfolio,
    removePortfolio,
  } = useFavorites();
  const viewingDetails = Boolean(internshipId);

  const myInternships = useMemo(
    () => internshipList.filter((internship) => internship.company === companyName),
    [companyName, internshipList]
  );

  const activeInternship = useMemo(
    () => myInternships.find((internship) => String(internship.id) === String(internshipId)),
    [internshipId, myInternships]
  );

  const sortedApplications = useMemo(() => {
    const applications = [...(activeInternship?.applications || [])];

    if (applicationSort === "top") {
      return applications.sort((a, b) => b.contributionScore - a.contributionScore || b.matchScore - a.matchScore);
    }

    if (applicationSort === "newest") {
      return applications.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
    }

    return applications;
  }, [activeInternship, applicationSort]);

  const suggestedApplications = useMemo(
    () =>
      (activeInternship?.applications || [])
        .filter((application) => favoritePortfolioIds.includes(application.portfolioId))
        .sort((a, b) => b.matchScore - a.matchScore || b.contributionScore - a.contributionScore),
    [activeInternship, favoritePortfolioIds]
  );

  const requestConfirmation = (action, onConfirm, variant = "gold") => {
    setConfirmation({ action, onConfirm, variant });
  };

  const showFeedback = (message) => {
    setSuccessMessage(message);
  };

  const viewInternship = (internship) => {
    navigate(`/internships/${internship.id}`);
  };

  const selectInternship = (internship) => {
    setSelectedListInternshipId((current) => current === internship.id ? null : internship.id);
  };

  const openAddForm = () => {
    setFormMode("add");
    setEditingInternship(null);
    setFormData(emptyInternshipForm);
    setErrors({});
  };

  const openEditForm = (event, internship) => {
    event.stopPropagation();
    setFormMode("edit");
    setEditingInternship(internship);
    setFormData({
      title: internship.title,
      details: internship.details || "",
      skills: (internship.skills || []).join(", "),
      duration: internship.duration,
      deadline: internship.deadline,
      languages: (internship.languages || []).join(", "),
      status: internship.status,
    });
    setErrors({});
  };

  const closeForm = () => {
    setFormMode(null);
    setEditingInternship(null);
    setErrors({});
  };

  const updateFormField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    if (errors[field] && value.trim()) {
      setErrors((current) => ({ ...current, [field]: "" }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    ["title", "details", "skills", "duration", "deadline", "languages"].forEach((field) => {
      if (!formData[field].trim()) {
        nextErrors[field] = "This field cannot be left empty";
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildInternshipPayload = () => ({
    title: formData.title.trim(),
    company: companyName,
    details: formData.details.trim(),
    skills: splitList(formData.skills),
    duration: formData.duration.trim(),
    deadline: formData.deadline,
    languages: splitList(formData.languages),
    status: formData.status,
  });

  const handleFormSubmit = (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    const payload = buildInternshipPayload();

    if (formMode === "add") {
      const newInternship = {
        id: Date.now(),
        ...payload,
        archived: false,
        applications: [],
      };

      requestConfirmation("add this internship", () => {
        setInternshipList((current) => [...current, newInternship]);
        setSelectedListInternshipId(newInternship.id);
        closeForm();
        showFeedback("Internship added successfully.");
      });
      return;
    }

    requestConfirmation("edit this internship", () => {
      setInternshipList((current) =>
        current.map((internship) =>
          internship.id === editingInternship.id
            ? { ...internship, ...payload }
            : internship
        )
      );
      closeForm();
      setSuccessMessage("Internship edited successfully.");
    });
  };

  const handleDelete = (event, internship) => {
    event.stopPropagation();
    requestConfirmation("delete this internship", () => {
      setInternshipList((current) => current.filter((item) => item.id !== internship.id));
      setSelectedListInternshipId((current) => current === internship.id ? null : current);
      if (viewingDetails) {
        navigate("/internships");
      }
      showFeedback("Internship deleted successfully.");
    }, "danger");
  };

  const handleHiringStatus = (event, internship) => {
    event.stopPropagation();
    const nextStatus = internship.status === "hiring" ? "filled" : "hiring";
    const action = nextStatus === "hiring"
      ? "set this internship as currently hiring"
      : "set this internship as position filled";

    requestConfirmation(action, () => {
      setInternshipList((current) =>
        current.map((item) =>
          item.id === internship.id ? { ...item, status: nextStatus } : item
        )
      );
      showFeedback(`Internship is now ${formatStatus(nextStatus).toLowerCase()}.`);
    });
  };

  const handleArchiveToggle = (event, internship) => {
    event.stopPropagation();

    if (!internship.archived && !isDeadlinePassed(internship.deadline)) {
      showFeedback("This internship can only be archived after its application deadline has passed.");
      return;
    }

    const action = internship.archived ? "unarchive this internship" : "archive this internship";
    requestConfirmation(action, () => {
      setInternshipList((current) =>
        current.map((item) =>
          item.id === internship.id ? { ...item, archived: !item.archived } : item
        )
      );
      showFeedback(internship.archived ? "Internship unarchived successfully." : "Internship archived successfully.");
    });
  };

  const handleApplicantStatusChange = (application, nextStatus) => {
    if (!activeInternship || application.status !== "nominated") return;

    requestConfirmation(
      `set ${application.studentName}'s application status to ${applicantStatusLabels[nextStatus].toLowerCase()}`,
      () => {
        setInternshipList((current) =>
          current.map((internship) =>
            internship.id === activeInternship.id
              ? {
                  ...internship,
                  applications: internship.applications.map((item) =>
                    item.id === application.id ? { ...item, status: nextStatus } : item
                  ),
                }
              : internship
          )
        );
        if (nextStatus === "accepted" || nextStatus === "rejected") {
          pushInternshipApplicationDecisionNotification({
            studentEmail: application.studentEmail,
            internshipTitle: activeInternship.title,
            companyName: activeInternship.company,
            decision: nextStatus,
          });
        }
        showFeedback(`${application.studentName}'s application status updated.`);
      }
    );
  };

  const handleFavoritePortfolioToggle = (application) => {
    const knownPortfolio = portfolios.find((portfolio) => portfolio.id === application.portfolioId);
    const portfolioTitle = knownPortfolio?.title || application.portfolioTitle;
    const isSaved = isFavoritePortfolio(application.portfolioId);

    requestConfirmation(
      `${isSaved ? "remove" : "save"} ${portfolioTitle} ${isSaved ? "from" : "to"} your favorite portfolios`,
      () => {
        if (isSaved) {
          removePortfolio(application.portfolioId);
          showFeedback("Portfolio removed from your favorites.");
        } else {
          savePortfolio(application.portfolioId);
          showFeedback("Portfolio saved to your favorites.");
        }
      },
      isSaved ? "danger" : "gold"
    );
  };

  const renderModals = () => (
    <>
      <InternshipFormModal
        formMode={formMode}
        formData={formData}
        errors={errors}
        onChange={updateFormField}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
      />

      <ConfirmActionModal
        isOpen={Boolean(confirmation)}
        onClose={() => setConfirmation(null)}
        action={confirmation?.action}
        onConfirm={() => {
          confirmation?.onConfirm();
          setConfirmation(null);
        }}
        variant={confirmation?.variant || "primary"}
      />

      {successMessage && (
        <SuccessToast message={successMessage} onClose={() => setSuccessMessage("")} />
      )}
    </>
  );

  if (viewingDetails) {
    if (!activeInternship) {
      return (
        <div>
          <PageHeader
            title="Internship Details"
            subtitle="This internship is not available for your company."
            action={<Button variant="secondary" onClick={() => navigate("/internships")}>Back</Button>}
          />
          <Card>
            <p className="text-text-secondary text-sm font-sans">Select another internship from your company list.</p>
          </Card>
          {renderModals()}
        </div>
      );
    }

    const canArchive = activeInternship.archived || isDeadlinePassed(activeInternship.deadline);

    return (
      <div>
        <PageHeader
          title="Internship Details"
          subtitle={activeInternship.title}
          action={<Button variant="secondary" onClick={() => navigate("/internships")}>Back to Internships</Button>}
        />

        <Card className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h2 className="font-display text-2xl text-text-primary">{activeInternship.title}</h2>
                <Badge variant={getStatusVariant(activeInternship.status)}>{formatStatus(activeInternship.status)}</Badge>
                {activeInternship.archived && <Badge variant="default">Archived</Badge>}
              </div>
              <p className="text-accent-blue text-sm font-sans mb-3">{activeInternship.company}</p>
              <p className="text-text-secondary text-sm font-sans max-w-3xl">{activeInternship.details}</p>
            </div>
            <Badge variant={isDeadlinePassed(activeInternship.deadline) ? "warning" : "blue"}>
              {isDeadlinePassed(activeInternship.deadline) ? "Deadline passed" : "Deadline open"}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <div>
              <p className="text-text-secondary text-xs uppercase tracking-widest font-sans mb-1">Duration</p>
              <p className="text-text-primary text-sm font-sans">{activeInternship.duration}</p>
            </div>
            <div>
              <p className="text-text-secondary text-xs uppercase tracking-widest font-sans mb-1">Deadline</p>
              <p className="text-text-primary text-sm font-mono">{activeInternship.deadline}</p>
            </div>
            <div>
              <p className="text-text-secondary text-xs uppercase tracking-widest font-sans mb-1">Applications</p>
              <p className="text-text-primary text-sm font-mono">{(activeInternship.applications || []).length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-text-secondary text-xs uppercase tracking-widest font-sans mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {activeInternship.skills.map((skill) => <Badge key={skill}>{skill}</Badge>)}
              </div>
            </div>
            <div>
              <p className="text-text-secondary text-xs uppercase tracking-widest font-sans mb-2">Programming Languages</p>
              <div className="flex flex-wrap gap-2">
                {activeInternship.languages.map((language) => <Badge key={language} variant="blue">{language}</Badge>)}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
            <Button size="sm" variant="secondary" onClick={(event) => openEditForm(event, activeInternship)}>Edit</Button>
            <Button size="sm" variant="ghost" onClick={(event) => handleHiringStatus(event, activeInternship)}>
              {activeInternship.status === "hiring" ? "Mark Filled" : "Set Hiring"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={!canArchive}
              className={!canArchive ? "opacity-50 cursor-not-allowed" : ""}
              onClick={(event) => handleArchiveToggle(event, activeInternship)}
            >
              {activeInternship.archived ? "Unarchive" : "Archive"}
            </Button>
            <Button size="sm" variant="danger" onClick={(event) => handleDelete(event, activeInternship)}>Delete</Button>
          </div>
        </Card>

        <Card className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="font-display text-lg text-text-primary">Top Suggested Applications</h2>
              <p className="text-text-secondary text-sm font-sans">
                Matched from your favorite portfolio list.
              </p>
            </div>
            <Badge variant="gold">
              {suggestedApplications.length} favorite portfolio{suggestedApplications.length === 1 ? "" : "s"}
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {suggestedApplications.length > 0 ? suggestedApplications.map((application) => (
              <div key={application.id} className="rounded-lg border border-border bg-bg-elevated px-4 py-3">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div>
                    <p className="text-text-primary text-sm font-sans">{application.studentName}</p>
                    <p className="text-text-secondary text-xs font-mono">{application.portfolioTitle}</p>
                  </div>
                  <Badge variant="gold">{application.matchScore}% match</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {application.skills.map((skill) => <Badge key={skill}>{skill}</Badge>)}
                </div>
              </div>
            )) : (
              <p className="text-text-secondary text-sm font-sans">No applications match your favorite portfolios for this internship yet.</p>
            )}
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="flex items-start justify-between gap-4 p-6 border-b border-border">
            <div>
              <h2 className="font-display text-lg text-text-primary">Student Applications</h2>
              <p className="text-text-secondary text-sm font-sans">Select an applicant status or sort by top contributors.</p>
            </div>
            <div className="flex justify-end">
              <select
                value={applicationSort}
                onChange={(event) => setApplicationSort(event.target.value)}
                className={`${selectClass} w-56`}
              >
                <option value="">No sorting</option>
                <option value="top">Top contributors</option>
                <option value="newest">Newest applications</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-border">
            {sortedApplications.length > 0 ? sortedApplications.map((application) => {
              const portfolioSaved = isFavoritePortfolio(application.portfolioId);

              return (
              <div key={application.id} className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(9rem,0.45fr)_minmax(0,1fr)_minmax(0,0.9fr)] gap-4 px-6 py-4 items-center">
                <div className="min-w-0">
                  <p className="text-text-primary text-sm font-sans truncate mb-1">{application.studentName}</p>
                  <p className="text-text-secondary text-xs font-mono truncate">{application.studentEmail}</p>
                  <p className="text-text-secondary text-xs font-mono truncate">Applied {application.appliedAt}</p>
                </div>

                <div>
                  <p className="text-text-secondary text-xs font-sans mb-1.5 block">Student Status</p>
                  <Badge variant={getStatusVariant(application.status)}>{applicantStatusLabels[application.status]}</Badge>
                </div>

                <div>
                  <p className="text-text-primary text-sm font-sans mb-1">{application.portfolioTitle}</p>
                  <p className="text-text-secondary text-xs font-mono">
                    {application.projectCount} projects - contributor score {application.contributionScore}
                  </p>
                  <Button
                    size="sm"
                    variant={portfolioSaved ? "gold" : "secondary"}
                    className="mt-3"
                    onClick={() => handleFavoritePortfolioToggle(application)}
                  >
                    {portfolioSaved ? "Remove Portfolio" : "Save Portfolio"}
                  </Button>
                </div>

                <div>
                  <label className="text-text-secondary text-xs font-sans mb-1.5 block">Decision</label>
                  {application.status === "nominated" ? (
                    <select
                      value=""
                      onChange={(event) => handleApplicantStatusChange(application, event.target.value)}
                      className={selectClass}
                    >
                      <option value="" disabled>Choose action</option>
                      <option value="accepted">Accept</option>
                      <option value="rejected">Reject</option>
                    </select>
                  ) : (
                    <div className={`${selectClass} flex items-center text-text-secondary`}>
                      Final decision made
                    </div>
                  )}
                </div>
              </div>
              );
            }) : (
              <p className="px-6 py-5 text-text-secondary text-sm font-sans">No students have applied for this internship yet.</p>
            )}
          </div>
        </Card>

        {renderModals()}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Company Internships"
        subtitle={`Manage internships offered by ${companyName}`}
        action={<Button variant="gold" onClick={openAddForm}>+ New Internship</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="My Internships" value={myInternships.length} />
        <StatCard label="Currently Hiring" value={myInternships.filter((item) => item.status === "hiring").length} />
        <StatCard label="Position Filled" value={myInternships.filter((item) => item.status === "filled").length} />
        <StatCard label="Archived" value={myInternships.filter((item) => item.archived).length} />
      </div>

      <div className="flex flex-col gap-4">
        {myInternships.map((internship) => {
          const canArchive = internship.archived || isDeadlinePassed(internship.deadline);
          const selected = selectedListInternshipId === internship.id;

          return (
            <Card
              key={internship.id}
              hover
              onClick={() => selectInternship(internship)}
              className={`cursor-pointer ${selected ? "border-accent-gold/60 bg-accent-gold/5" : ""}`}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  selectInternship(internship);
                }
              }}
            >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-display text-base text-text-primary">{internship.title}</h3>
                      {selected && <Badge variant="gold">Selected</Badge>}
                    </div>
                    <p className="text-xs font-mono text-text-secondary">Deadline: {internship.deadline}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={getStatusVariant(internship.status)}>{formatStatus(internship.status)}</Badge>
                    {internship.archived && <Badge variant="default">Archived</Badge>}
                  </div>
                </div>

                <p className="text-text-secondary text-sm font-sans mb-4 line-clamp-2">{internship.details}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {internship.skills.map((skill) => <Badge key={skill}>{skill}</Badge>)}
                </div>

                {selected ? (
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                    <Button
                      size="sm"
                      variant="gold"
                      onClick={(event) => {
                        event.stopPropagation();
                        viewInternship(internship);
                      }}
                    >
                      View
                    </Button>
                    <Button size="sm" variant="secondary" onClick={(event) => openEditForm(event, internship)}>Edit</Button>
                    <Button size="sm" variant="ghost" onClick={(event) => handleHiringStatus(event, internship)}>
                      {internship.status === "hiring" ? "Mark Filled" : "Set Hiring"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={!canArchive}
                      className={!canArchive ? "opacity-50 cursor-not-allowed" : ""}
                      onClick={(event) => handleArchiveToggle(event, internship)}
                    >
                      {internship.archived ? "Unarchive" : "Archive"}
                    </Button>
                    <Button size="sm" variant="danger" onClick={(event) => handleDelete(event, internship)}>Delete</Button>
                  </div>
                ) : (
                  <p className="pt-3 border-t border-border text-xs font-sans text-text-secondary">
                    Select this internship to view available actions.
                  </p>
                )}
              </Card>
          );
        })}

        {myInternships.length === 0 && (
          <Card>
            <p className="text-text-secondary text-sm font-sans">No internships have been added for this company yet.</p>
          </Card>
        )}
      </div>

      {renderModals()}
    </div>
  );
}

export default function Internships() {
  const { user } = useContext(AuthContext);
  const [internshipList, setInternshipList] = useState(getInitialInternships);

  useEffect(() => {
    localStorage.setItem(internshipsStorageKey, JSON.stringify(internshipList));
  }, [internshipList]);

  if (user?.role === "employer") {
    return (
      <EmployerInternships
        user={user}
        internshipList={internshipList}
        setInternshipList={setInternshipList}
      />
    );
  }

  return (
    <StudentInternshipBrowser
      internshipList={internshipList}
      setInternshipList={setInternshipList}
      user={user}
    />
  );
}
