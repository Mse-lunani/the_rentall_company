// src/app/dashboard/profile/page.jsx
import ProfileCard from "./ProfileCard";
import ProfileForm from "./ProfileForm";
import PasswordForm from "./PasswordForm";

export default function ProfilePage() {
  return (
    <div className="content-wrapper">
      <section className="content">
        <div className="container-xxl flex-grow-1 container-p-y">
          <h4 className="mb-4">User Profile</h4>
          <div className="row">
            <div className="col-md-4">
              <ProfileCard />
            </div>
            <div className="col-md-8">
              <ProfileForm />
              <hr />
              <PasswordForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
