import { SignInLayout, type ISignInLayoutProps } from './signin-layout'

export function ModuleLayout({
  className,
  children,
  ...props
}: ISignInLayoutProps) {
  //const path = usePathname()

  //const crumbs = createCrumbs(path)

  return (
    <SignInLayout
      className={className}
      // leftHeaderChildren={
      //   // <BaseButton onClick={() => setModalVisible(true)}>
      //   //   <FontAwesomeIcon
      //   //     icon={faGear}
      //   //     className="text-white/50 trans-300 transition-color group-hover:text-white"
      //   //   />
      //   // </BaseButton>

      //   <ModuleInfoButton info={info} />
      // }
      {...props}
    >
      {children}
    </SignInLayout>
  )
}
