import bcrypt from "bcrypt";

export const hashString = (data: string): string => {
  //bcript utilizeaza cifrul Blowfish pt hashing
  const salt = bcrypt.genSaltSync();
  return bcrypt.hashSync(data, salt);
};
