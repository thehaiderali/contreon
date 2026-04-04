import { Router } from "express";
import { getAllMemberships } from "../controllers/memberships.controller.js";

const membershipRouter=Router()
membershipRouter.get("/",getAllMemberships)

export default membershipRouter