import conf from "../conf/conf.js";
import { Client, ID, Databases, Storage, Query } from "appwrite";

export class Service {
  client = new Client();
  databases;
  bucket;

  constructor() {
    this.client
      .setEndpoint(conf.appwriteUrl)
      .setProject(conf.appwriteProjectId);
    this.databases = new Databases(this.client);
    this.bucket = new Storage(this.client);
  }

  async createPost({
    title,
    slug,
    content,
    featuredImage,
    status,
    userId,
    owner,
  }) {
    let attempts = 0;
    while (attempts < 3) {
      try {
        return await this.databases.createDocument(
          conf.appwriteDatabaseId,
          conf.appwriteCollectionId,
          slug,
          {
            title,
            content,
            featuredImage,
            status,
            userId,
            owner,
          }
        );
      } catch (error) {
        console.log(`Appwrite service :: createPost :: error :: attempt ${attempts + 1}`, error);
        attempts++;
        if (attempts < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // wait for 1 second before retrying
        } else {
          return false;
        }
      }
    }
  }

  async updatePost(slug, { title, content, featuredImage, status }) {
    try {
      return await this.databases.updateDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        slug,
        {
          title,
          content,
          featuredImage,
          status,
        }
      );
    } catch (error) {
      console.log("Appwrite serive :: updatePost :: error", error);
    }
  }

  async deletePost(slug) {
    let attempts = 0;
    while (attempts < 3) {
      try {
        await this.databases.deleteDocument(
          conf.appwriteDatabaseId,
          conf.appwriteCollectionId,
          slug
        );
        return true;
      } catch (error) {
        console.log(`Appwrite service :: deletePost :: error :: attempt ${attempts + 1}`, error);
        attempts++;
        if (attempts < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // wait for 1 second before retrying
        } else {
          return false;
        }
      }
    }
  }

  async getPost(slug) {
    try {
      return await this.databases.getDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        slug
      );
    } catch (error) {
      console.log("Appwrite serive :: getPost :: error", error);
      return false;
    }
  }

  async getPosts(queries = [Query.equal("status", "active")]) {
    try {
      return await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        queries
      );
    } catch (error) {
      console.log("Appwrite serive :: getPosts :: error", error);
      return false;
    }
  }

  // file upload service

  async uploadFile(file) {
    try {
      return await this.bucket.createFile(
        conf.appwriteBucketId,
        ID.unique(),
        file
      );
    } catch (error) {
      console.log("Appwrite serive :: uploadFile :: error", error);
      return false;
    }
  }

  async deleteFile(fileId) {
    try {
      await this.bucket.deleteFile(conf.appwriteBucketId, fileId);
      return true;
    } catch (error) {
      console.log("Appwrite serive :: deleteFile :: error", error);
      return false;
    }
  }

  getFilePreview(fileId) {
    return this.bucket.getFilePreview(conf.appwriteBucketId, fileId);
  }

  async likePost(postId, likes) {
    return await this.databases.updateDocument(
      conf.appwriteDatabaseId,
      conf.appwriteCollectionId,
      postId,
      {
        likes,
      }
    );
  }

  async savePost(userId, saved) {
    return await this.databases.updateDocument(
      conf.appwriteDatabaseId,
      conf.appwriteUserCollectionId,
      userId,
      {
        saved,
      }
    );
  }
}

const service = new Service();
export default service;
