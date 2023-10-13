class user {
    constructor(name, cityId, email, password) {
      this.name = name;
      this.cityId = cityId;
      this.email = email;
      this.password = password;
    }
  
    setId(id) {
      this.id = id;
    }
  
    setSlug(slug) {
      this.slug = slug;
    }
  
    setBirthDate(birthDate) {
      this.birthDate = birthDate;
    }
  
    setCreatedAt(createdAt) {
      this.createdAt = createdAt;
    }
  
    setRegistered(registered) {
      this.registered = registered;
    }
  }
  
  module.exports = user;