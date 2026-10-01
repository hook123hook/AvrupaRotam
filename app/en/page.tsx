import { CareerPlatform, type PlatformCopy } from "@/components/career-platform";
import { chatGPTSignInPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { getPublishedJobs } from "@/lib/jobs";

export const dynamic = "force-dynamic";

const copy: PlatformCopy = {
  skip:"Skip to content", official:"Current opportunities linked to official sources", checked:"Listing sources and details appear on each listing",
  jobs:"Jobs", advisory:"Advisory", process:"Process", account:"My account", member:"Join", language:"EN / TR",
  eyebrow:"Transparent European career platform", title:"Your next job in Europe,", titleAccent:"on the right route.", lead:"Verifiable opportunities, profile advisory and secure application management for skilled and unskilled workers.",
  viewJobs:"View open roles ↓", generalApply:"General application", statCountries:"focus countries", statProfiles:"profile advisory", statOpportunities:"current opportunities",
  routeTitle:"Filter your route", routeText:"Find open positions by country and field.", all:"All", country:"Country", sector:"Field", show:"Show opportunities →", assessment:"Applications are assessed against profile and position requirements.",
  memberEyebrow:"AvrupaRotam membership", memberTitle:"Your career file in one place.", memberText:"Create your membership, upload your CV securely and track initial applications from your account.",
  memberBenefit1:"Personal candidate profile", memberBenefit2:"Secure CV record", memberBenefit3:"Application history", openMembership:"Create my membership",
  currentEyebrow:"Current open positions", currentTitle:"Opportunities you can verify", currentText:"View listing details on this page and submit an initial application with your CV.",
  officialSource:"Official source", verify:"Verify at source", interested:"Initial application", moreTitle:"More positions are available.", moreText:"EURES and national employment portals publish new opportunities regularly.", eures:"EURES opportunities",
  advisoryTitle:"A European route shaped around your profile.", advisoryText:"Advisory support is not limited to specific occupations or the four focus countries.", skilledTitle:"Skilled and unskilled workers", skilledText:"Profile assessment and process guidance for qualified professionals, technical workers, new entrants and support staff.",
  countriesTitle:"More countries for suitable profiles", countriesText:"Other European destinations are assessed according to language, experience, occupation, visa eligibility and employer demand.",
  processTitle:"A transparent five-step process", steps:["Membership and CV","Profile assessment","Employer interview","Offer and contract","Visa and relocation"],
  footerLine:"The right route to your next job in Europe.", corporate:"Corporate", privacy:"Privacy and trust", terms:"Terms of use",
  membershipDialog:"Create your membership", membershipDescription:"Your candidate profile and CV are stored securely in your account.", fullName:"Full name", email:"Email", phone:"Phone", occupation:"Occupation or expertise",
  cv:"Curriculum vitae (CV)", cvHelp:"PDF, DOC or DOCX · Maximum 5 MB", consent:"I consent to the processing of my personal data for membership and candidate assessment.", saveMembership:"Complete membership", saving:"Saving…", membershipSuccess:"Your membership has been created and your CV has been stored securely.",
  applicationDialog:"Complete your initial application", applicationDescription:"Every initial application is assessed together with a current CV.", targetRole:"Position", targetCountry:"Target country", experience:"Experience and language skills",
  sendApplication:"Send initial application", applicationSuccess:"Your initial application and CV have been received. Our team will contact you for the suitability assessment.",
  error:"The request could not be completed. Your information remains in the form so you can try again.", invalidCv:"Please attach a PDF, DOC or DOCX CV smaller than 5 MB.", signIn:"Sign in",
};

export default async function EnglishHome() {
  const user = await getChatGPTUser();
  const jobs = await getPublishedJobs("en");
  return <CareerPlatform locale="en" brand="AvrupaRotam" languageHref="/" jobs={jobs} copy={copy} user={user && { displayName:user.displayName, email:user.email }} signInPath={chatGPTSignInPath("/en/")} />;
}
