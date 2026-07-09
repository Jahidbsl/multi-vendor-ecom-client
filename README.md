## 🛠️ Tech Stack

This project is built using modern web development technologies:

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **UI Component Library:** [HeroUI](https://www.heroui.com/)
- **Icons:** [@gravity-ui/icons](https://gravity-ui.com/icons) & [React Icons](https://react-icons.github.io/react-icons/)
- **Notifications:** [React Toastify](https://fkhadra.github.io/react-toastify/)
- **Authentication:** [Better Auth](https://www.better-auth.com/)

---

## 🔐 Password Requirements

When registering for an account, your password must meet the following validation criteria:

- **Minimum Length:** 8 characters
- **Maximum Length:** Unlimited
- **Uppercase Letter:** At least one uppercase letter (`A-Z`)
- **Number:** At least one numerical digit (`0-9`)
- **Confirmation:** The *Confirm Password* field must match the *Password* field exactly.

### Password Validation Examples

| Password | Valid? | Reason |
| :--- | :---: | :--- |
| `pass123` | ❌ | Missing an uppercase letter |
| `PASSWORD` | ❌ | Missing a number |
| `Password123` | ✅ | Meets all criteria |
| `MySecurePass2026!` | ✅ | Meets all criteria |