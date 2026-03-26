export class User {
  userId: string;
  name: string;
  email: string;
  phone: string;
  profileImage: string;
  createdAt: Date;

  constructor(
    userId: string,
    name: string,
    email: string,
    phone: string,
    profileImage: string = "",
    createdAt: Date = new Date()
  ) {
    this.userId = userId;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.profileImage = profileImage;
    this.createdAt = createdAt;
  }

  getProfile() {
    return {
      userId: this.userId,
      name: this.name,
      email: this.email,
      phone: this.phone,
      profileImage: this.profileImage,
      createdAt: this.createdAt,
    };
  }
}
