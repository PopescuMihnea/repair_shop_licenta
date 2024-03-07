import VerifyLink from "../models/verifyLink";
import ResetLink from "../models/resetLink";

export const deleteOldLinks = () => {
  const currentDate = new Date();

  VerifyLink.deleteMany({ expires: { $lt: currentDate } })
    .then((result) => {
      console.log(`${result.deletedCount} verify link(s) deleted.`);
    })
    .catch((error) => {
      console.error("Error deleting old verify links:", error);
    });

  ResetLink.deleteMany({ expires: { $lt: currentDate } })
    .then((result) => {
      console.log(`${result.deletedCount} reset link(s) deleted.`);
    })
    .catch((error) => {
      console.error("Error deleting old reset links:", error);
    });
};
