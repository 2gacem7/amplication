import { GitClientService } from "./git-client.service";
import { ILogger } from "@amplication/util/logging";
import { GitCli } from "./providers/git-cli";
import { GitFactory } from "./git-factory";
import { GitProvider } from "./git-provider.interface";
import { Bot, EnumGitProvider } from "./types";
import { GitError } from "simple-git";

jest.mock("./providers/git-cli");
jest.mock("simple-git");
jest.mock("./git-factory");

const logger: ILogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  child: jest.fn(() => {
    return logger;
  }),
};

const amplicationBotOrIntegrationApp: Bot = {
  id: "2",
  login: "amplication[bot]",
  gitAuthor: "amplication[bot] <abot@email.local>",
};

const amplicationGitUser = {
  name: "amplication[bot]",
  email: "bot@amplication.com",
};
const amplicationGitUserAuthor = `${amplicationGitUser.name} <${amplicationGitUser.email}>`;

describe("GitClientService", () => {
  let service: GitClientService;
  const gitDiffMock = jest.fn();
  const gitLogMock = jest.fn();
  const gitGetFirstCommitShaMock = jest.fn();
  const cherryPickMock = jest.fn();
  const cherryPickAbortMock = jest.fn();

  const gitCliMock: GitCli = {
    gitAuthorUser: amplicationGitUserAuthor,
    log: gitLogMock,
    checkout: jest.fn(),
    reset: jest.fn(),
    push: jest.fn(),
    resetState: jest.fn(),
    diff: gitDiffMock,
    cherryPick: cherryPickMock,
    cherryPickAbort: cherryPickAbortMock,
    getFirstCommitSha: gitGetFirstCommitShaMock,
  } as unknown as GitCli;

  const amplicationBotIdentityMock = jest.fn();
  const initMock = jest.fn();
  const getGitInstallationUrlMock = jest.fn();
  const getCurrentOAuthUserMock = jest.fn();
  const getOAuthTokensMock = jest.fn();
  const refreshAccessTokenMock = jest.fn();
  const getGitGroupsMock = jest.fn();
  const getRepositoryMock = jest.fn();
  const getRepositoriesMock = jest.fn();
  const createRepositoryMock = jest.fn();
  const deleteGitOrganizationMock = jest.fn();
  const getOrganizationMock = jest.fn();
  const getFileMock = jest.fn();
  const createPullRequestFromFilesMock = jest.fn();
  const getPullRequestMock = jest.fn();
  const createPullRequestMock = jest.fn();
  const getBranchMock = jest.fn();
  const createBranchMock = jest.fn();
  const getCloneUrlMock = jest.fn();
  const createPullRequestCommentMock = jest.fn();
  const gitProviderMock: GitProvider = {
    getAmplicationBotIdentity: amplicationBotIdentityMock,
    init: initMock,
    getGitInstallationUrl: getGitInstallationUrlMock,
    getCurrentOAuthUser: getCurrentOAuthUserMock,
    getOAuthTokens: getOAuthTokensMock,
    refreshAccessToken: refreshAccessTokenMock,
    getGitGroups: getGitGroupsMock,
    getRepository: getRepositoryMock,
    getRepositories: getRepositoriesMock,
    createRepository: createRepositoryMock,
    deleteGitOrganization: deleteGitOrganizationMock,
    getOrganization: getOrganizationMock,
    getFile: getFileMock,
    createPullRequestFromFiles: createPullRequestFromFilesMock,
    getPullRequest: getPullRequestMock,
    createPullRequest: createPullRequestMock,
    getBranch: getBranchMock,
    createBranch: createBranchMock,
    getCloneUrl: getCloneUrlMock,
    createPullRequestComment: createPullRequestCommentMock,
    name: EnumGitProvider.Github,
    domain: "",
  };

  beforeEach(() => {
    jest.spyOn(GitFactory, "getProvider").mockResolvedValue(gitProviderMock);
    service = new GitClientService();

    amplicationBotIdentityMock.mockResolvedValue(
      amplicationBotOrIntegrationApp
    );

    service.create(null, null, logger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("when there are no commits from amplication <bot@amplication.com> and there are commits for amplication[bot] (or amplication provider integration)", () => {
    beforeEach(() => {
      gitLogMock.mockResolvedValue({
        all: [
          {
            hash: "sghfsjfdsfd34234",
            author_name: amplicationBotOrIntegrationApp.login,
            author_email: "monster@spagetti.com",
          },
          {
            hash: "hhfdfdgdf34234gd",
            author_name: amplicationBotOrIntegrationApp.login,
            author_email: "monster@spagetti.com",
          },
        ],
        total: 2,
        latest: {
          hash: "sghfsjfdsfd34234",
          author_name: amplicationBotOrIntegrationApp.login,
          author_email: "monster@spagetti.com",
        },
      });
    });

    it("should return the diff of the latest commit of amplication[bot] (or amplication provider integration)", async () => {
      await service.preCommitProcess({
        branchName: "amplication",
        gitCli: gitCliMock,
      });

      expect(gitLogMock).toBeCalledTimes(1);
      expect(gitDiffMock).toBeCalledWith("sghfsjfdsfd34234");
    });
  });

  describe("when there is not amplication[bot] (or amplication provider integration)", () => {
    beforeEach(() => {
      amplicationBotIdentityMock.mockResolvedValue(null);
    });

    it("should return the diff of the latest commit of amplication <bot@amplication.com>", async () => {
      gitLogMock.mockResolvedValue({
        all: [
          {
            hash: "sghfsjfdsfd34234",
            author_name: "amplication",
            author_email: "bot@amplication.com",
          },
          {
            hash: "hhfdfdgdf34234gd",
            author_name: amplicationGitUserAuthor,
            author_email: "bot@amplication.com",
          },
        ],
        total: 2,
        latest: {
          hash: "sghfsjfdsfd34234",
          author_name: amplicationGitUserAuthor,
          author_email: "bot@amplication.com",
        },
      });

      await service.preCommitProcess({
        branchName: "amplication",
        gitCli: gitCliMock,
      });

      expect(gitLogMock).toBeCalledTimes(1);
      expect(gitDiffMock).toBeCalledWith("sghfsjfdsfd34234");
    });

    it("should not call the gitlog for author amplication[bot] (or amplication provider integration)", async () => {
      await service.preCommitProcess({
        branchName: "amplication",
        gitCli: gitCliMock,
      });

      expect(gitLogMock).toHaveBeenCalledTimes(1);
      expect(gitLogMock).toBeCalledWith([amplicationGitUserAuthor], 1);
    });
  });

  describe("restoreAmplicationBranchIfNotExists", () => {
    beforeEach(() => {
      amplicationBotIdentityMock.mockResolvedValue(
        amplicationBotOrIntegrationApp
      );
    });

    describe("when the new branch does not exists", () => {
      it("should create a new branch from the first commit with all the amplication authored commits from the default branch", async () => {
        // Arrange
        const args = {
          branchName: "new-branch",
          owner: "owner",
          repositoryName: "repository",
          gitCli: gitCliMock,
          repositoryGroupName: "group",
          defaultBranch: "default",
          baseBranch: "base",
        };
        getBranchMock.mockResolvedValueOnce(null);

        gitGetFirstCommitShaMock.mockResolvedValueOnce({
          sha: "first-commit-sha",
        });

        createBranchMock.mockResolvedValueOnce({ name: "new-branch" });

        gitLogMock.mockResolvedValue({
          total: 3,
          all: [
            { hash: "commit-3" },
            { hash: "commit-2" },
            { hash: "commit-1" },
          ],
          latest: { hash: "commit-3" },
        });

        cherryPickMock.mockResolvedValue(undefined);

        // Act
        const result = await service.restoreAmplicationBranchIfNotExists(args);

        // Assert the result
        expect(result).toEqual({ name: "new-branch" });
        expect(gitProviderMock.getBranch).toHaveBeenCalledWith(args);
        expect(gitGetFirstCommitShaMock).toHaveBeenCalledWith("base");
        expect(gitProviderMock.createBranch).toHaveBeenCalledWith({
          owner: "owner",
          branchName: "new-branch",
          repositoryName: "repository",
          repositoryGroupName: "group",
          pointingSha: "first-commit-sha",
          baseBranchName: "base",
        });
        expect(gitLogMock).toHaveBeenCalledWith(
          [amplicationBotOrIntegrationApp.gitAuthor, amplicationGitUserAuthor],
          -1
        );
        expect(cherryPickMock).toHaveBeenCalledTimes(3);
      });

      it("should skip empty commits when it creates a new branch from the first commit with all the amplication authored commits from the default branch", async () => {
        // Arrange
        const args = {
          branchName: "new-branch",
          owner: "owner",
          repositoryName: "repository",
          gitCli: gitCliMock,
          repositoryGroupName: "group",
          defaultBranch: "default",
          baseBranch: "base",
        };
        const emptyCommitSha = "commit-2";
        const successfullCommitShas = [];

        getBranchMock.mockResolvedValueOnce(null);

        gitGetFirstCommitShaMock.mockResolvedValueOnce({
          sha: "first-commit-sha",
        });

        createBranchMock.mockResolvedValueOnce({ name: "new-branch" });

        gitLogMock.mockResolvedValue({
          total: 3,
          all: [
            { hash: "commit-3" },
            { hash: emptyCommitSha },
            { hash: "commit-1" },
          ],
          latest: { hash: "commit-3" },
        });

        cherryPickMock.mockImplementation(async (sha) => {
          if (sha === emptyCommitSha) {
            throw new GitError();
          }
          successfullCommitShas.push(sha);
          return;
        });

        // Act
        const result = await service.restoreAmplicationBranchIfNotExists(args);

        // Assert the result
        expect(result).toEqual({ name: "new-branch" });
        expect(gitProviderMock.getBranch).toHaveBeenCalledWith(args);
        expect(gitGetFirstCommitShaMock).toHaveBeenCalledTimes(1);
        expect(gitProviderMock.createBranch).toHaveBeenCalledTimes(1);
        expect(gitLogMock).toHaveBeenCalledTimes(1);
        expect(cherryPickMock).toHaveBeenCalledTimes(3);
        expect(cherryPickAbortMock).toHaveBeenCalledTimes(1);
        expect(successfullCommitShas).toEqual(["commit-1", "commit-3"]);
      });
    });

    it("should return an existing branch without creating a new one", async () => {
      const args = {
        branchName: "existing-branch",
        owner: "owner",
        repositoryName: "repository",
        gitCli: gitCliMock,
        repositoryGroupName: "group",
        defaultBranch: "default",
        baseBranch: "base",
      };

      getBranchMock.mockResolvedValue({
        name: "existing-branch",
      });

      const result = await service.restoreAmplicationBranchIfNotExists(args);

      expect(result).toEqual({ name: "existing-branch" });
      expect(gitProviderMock.getBranch).toHaveBeenCalledWith(args);
      expect(gitGetFirstCommitShaMock).not.toHaveBeenCalled();
      expect(gitProviderMock.createBranch).not.toHaveBeenCalled();
      expect(gitLogMock).not.toHaveBeenCalled();
    });
  });
});
