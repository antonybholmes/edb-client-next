msg=$1 #"Bug fixes and updates."
type=$2
branch="dev"


if [[ -z "${msg}" ]]
then
	msg="Bug fixes and updates."
fi

if [[ -z "${type}" ]]
then
	type="Fixed"
fi

pnpm update-module-version
pnpm update-version
tsx scripts/update-changelog.ts "${msg}" "${type}"
pnpm make-changelog-markdown
pnpm make-help-toc

./base_commit.sh -t "${type}" -m "${msg}" -b dev
